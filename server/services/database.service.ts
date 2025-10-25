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

// In-memory SQLite dialect for initialization
// This is used to create the Kysely instance before loading the actual database connection
const memory = new SqliteDialect({ database: new SQLite(':memory:') })

const logger = rootLogger.child({ label: 'db' })

export default class DatabaseService extends Kysely<Database> {
    public static readonly KEY = 'db'
    public configConnectionName = 'initial'
    public configConnection = ''
    public driver: 'sqlite' | 'mysql' | 'postgresql' = 'sqlite'


    constructor(kyselyConfig?: KyselyConfig & { dialect: Dialect }) {
        const config = kyselyConfig || { dialect: memory }
        
        super(config)
    }

    public createConnection(driver: 'sqlite' | 'mysql' | 'postgresql', options: any) {
        const connection: any = { driver }

        if (driver === 'sqlite') {
            let database = options.database || 'storage/database.sqlite'
            database = database.startsWith('/') ? database : basePath(database)
            connection.database = database
        }
    
        if (driver === 'mysql') {
            connection.host = options.host || 'localhost'
            connection.port = options.port || 3306
            connection.database = options.database
            connection.user = options.user
            connection.password = options.password
        }
    
        if (driver === 'postgresql') {
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

        if (connection.driver === 'sqlite') {
            dialect = new SqliteDialect({ database: new SQLite(connection.database) })
        }

        if (connection.driver === 'mysql') {
            const pool = createPool(validator.validate(connection, schemas.connection.mysql))

            try {
                const conn = await pool.promise().getConnection()

                conn.release()
            } catch (error) {
                throw new Error(`Failed to connect to MySQL database: ${error.message}`)
            }

            dialect = new MysqlDialect({ 
                pool: async () => pool as any,
            })
        }

        if (connection.driver === 'postgresql') {
            const pool = new Pool(validator.validate(connection, schemas.connection.postgresql))

            try {
                const client = await pool.connect()
                client.release()
            } catch (error: any) {
                throw new Error(`Failed to connect to PostgreSQL database: ${error.message}`)
            }

            dialect = new PostgresDialect({ 
                pool: pool,
            })
        }

        if (!dialect) {
            throw new Error(`Unsupported database driver: ${connection.driver}`)
        }

        const db = new DatabaseService({
            dialect: dialect,
        })

        return db
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

        if (this.configConnectionName === name && this.configConnection === connection.database) {
            return
        }

        const db = await this.createDatabase(connection)

        db.configConnectionName = name
        db.configConnection = connection.database
        db.driver = connection.driver

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