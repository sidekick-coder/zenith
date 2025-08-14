import { SqliteDialect } from 'kysely'
import type { Dialect, KyselyConfig, } from 'kysely'
import { Kysely } from 'kysely'
import SQLite from 'better-sqlite3'
import rootLogger from '../facades/logger.facade.ts'
import type { Database } from './types.ts'
import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import { SqliteBooleanPlugin } from '#server/database/plugins/sqliteBoolean.plugin.ts'

// In-memory SQLite dialect for initialization
// This is used to create the Kysely instance before loading the actual database connection
const memory = new SqliteDialect({ database: new SQLite(':memory:') })

const logger = rootLogger.child({ label: 'db' })

export default class DatabaseManager extends Kysely<Database> {
    public static readonly DI_KEY = 'db'
    public configConnectionName = 'initial'
    public configConnection = ''


    constructor(kyselyConfig?: KyselyConfig & { dialect: Dialect }) {
        const config = kyselyConfig || { dialect: memory }
        
        super(config)
    }

    public async load(connectionName?: string, quiet = false) {
        const defaultConnection = config.get('database.default')
        const connections = config.get('database.connections', {})

        const name = connectionName || defaultConnection

        const connection = connections[name]

        if (!connection) {
            logger.warn(`Database connection "${name}" not found. Using in-memory database.`)
            return
        }

        let dialect: Dialect | undefined = undefined

        if (connection.driver === 'sqlite') {
            dialect = new SqliteDialect({ database: new SQLite(connection.database) })
        }

        if (!dialect) {
            throw new Error(`Unsupported database driver: ${connection.driver}`)
        }

        const db = new DatabaseManager({
            dialect: dialect,
            plugins: [new SqliteBooleanPlugin()]
        })

        db.configConnectionName = name
        db.configConnection = connection.database

        if (di.has(DatabaseManager.DI_KEY)) {
            await di.get<DatabaseManager>(DatabaseManager.DI_KEY).destroy()
        }

        di.set(DatabaseManager.DI_KEY, db)

        if (!quiet) {
            logger.info('connected to database', {
                connection: name,
                database: connection.database,
                driver: connection.driver,
            })

        }

    }
}