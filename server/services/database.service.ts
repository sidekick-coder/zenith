import { MysqlDialect, PostgresDialect, SqliteDialect } from 'kysely'
import type { Dialect, KyselyConfig, } from 'kysely'
import { Kysely } from 'kysely'
import SQLite from 'better-sqlite3'
import { createPool } from 'mysql2'
import { Pool } from 'pg'
import rootLogger from '../facades/logger.facade.ts'
import type { Database } from '../contracts/database.contract.ts'
import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import env from '#server/facades/env.facade.ts'

// In-memory SQLite dialect for initialization
// This is used to create the Kysely instance before loading the actual database connection
const memory = new SqliteDialect({ database: new SQLite(':memory:') })

const logger = rootLogger.child({ label: 'db' })

interface DatabaseServiceOptions extends KyselyConfig {
    dialect: Dialect
    debug?: boolean
}

export default class DatabaseService extends Kysely<Database> {
    public static memoryDialect = memory

    public configConnectionName = 'initial'
    public configConnection = ''
    public dialect: 'sqlite' | 'mysql' | 'postgresql' = 'sqlite'
    public debug = false
    public logger = logger.child({ label: 'database' })

    constructor(config: DatabaseServiceOptions) {        
        super(config)

        this.debug = config.debug || false
    }

    public createConnection(dialect: 'sqlite' | 'mysql' | 'postgresql', options: any) {
        const connection: any = { dialect }

        if (dialect === 'sqlite') {
            let database = options.database || 'storage/database.sqlite'
            database = database.startsWith('/') ? database : basePath(database)
            connection.database = database
        }
    
        if (dialect === 'mysql') {
            connection.host = options.host || 'localhost'
            connection.port = options.port || 3306
            connection.database = options.database
            connection.user = options.user
            connection.password = options.password
        }
    
        if (dialect === 'postgresql') {
            connection.host = options.host || 'localhost'
            connection.port = options.port || 5432
            connection.database = options.database
            connection.user = options.user
            connection.password = options.password
        }

        return connection
    }

    public async createDatabase(connection: Record<string, any>) {
        let dialect: Dialect | undefined = undefined

        if (connection.dialect === 'sqlite') {
            dialect = new SqliteDialect({ database: new SQLite(connection.database) })
        }

        if (connection.dialect === 'mysql') {
            const pool = createPool(validator.validate(connection, schemas.connection.mysql))

            try {
                const conn = await pool.promise().getConnection()

                conn.release()
            } catch (error: any) {
                throw new Error(`Failed to connect to MySQL database: ${error?.message}`)
            }

            dialect = new MysqlDialect({ pool: async () => pool as any, })
        }

        if (connection.dialect === 'postgresql') {
            const pool = new Pool(validator.validate(connection, schemas.connection.postgresql))

            try {
                const client = await pool.connect()
                client.release()
            } catch (error: any) {
                throw new Error(`Failed to connect to PostgreSQL database: ${error.message}`)
            }

            dialect = new PostgresDialect({ pool: pool, })
        }

        if (!dialect) {
            throw new Error(`Unsupported database dialect: ${connection.dialect}`)
        }

        const db = new DatabaseService({ dialect: dialect, })

        return db
    }

    public async load(connectionName?: string) {
        const defaultConnection = config.get('database.default')
        const connections = config.get('database.connections', {})

        const name = connectionName || defaultConnection

        const connection = connections[name]

        if (!connection && !env.get('ZARTE')) {
            logger.warn(`Database connection "${name}" not found`)
        }
        
        if (!connection) {
            return
        }

        if (this.configConnectionName === name && this.configConnection === connection.database) {
            return
        }

        const db = await this.createDatabase(connection)

        db.configConnectionName = name
        db.configConnection = connection.database
        db.dialect = connection.dialect

        if (di.has(DatabaseService)) {
            await di.get<DatabaseService>(DatabaseService).destroy()
        }

        di.set(DatabaseService, db)

        if (this.debug) {
            this.logger.debug('connected to database', {
                connection: name,
                database: connection.database,
                dialect: connection.dialect,
            })

        }
    }
}
