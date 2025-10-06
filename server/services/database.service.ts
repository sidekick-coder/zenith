import { SqliteDialect } from 'kysely'
import type { Dialect, KyselyConfig, } from 'kysely'
import { Kysely } from 'kysely'
import SQLite from 'better-sqlite3'
import rootLogger from '../facades/logger.facade.ts'
import type { Database } from '../contracts/database.contract.ts'
import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'

// In-memory SQLite dialect for initialization
// This is used to create the Kysely instance before loading the actual database connection
const memory = new SqliteDialect({ database: new SQLite(':memory:') })

const logger = rootLogger.child({ label: 'db' })

export default class DatabaseService extends Kysely<Database> {
    public static readonly KEY = 'db'
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

        const db = new DatabaseService({
            dialect: dialect,
        })

        db.configConnectionName = name
        db.configConnection = connection.database

        if (di.has(DatabaseService.KEY)) {
            await di.get<DatabaseService>(DatabaseService.KEY).destroy()
        }

        di.set(DatabaseService.KEY, db)

        if (!quiet) {
            logger.info('connected to database', {
                connection: name,
                database: connection.database,
                driver: connection.driver,
            })

        }

    }
}