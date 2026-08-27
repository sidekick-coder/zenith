import { MysqlDialect, PostgresDialect, SqliteDialect } from 'kysely'
import type { Dialect } from 'kysely'
import { Kysely } from 'kysely'
import SQLite from 'better-sqlite3'
import { createPool } from 'mysql2'
import { Pool } from 'pg'
import { DatabaseGateway, container } from '@sidekick-coder/zenith-kit/server'
import type { Database } from '../contracts/database.contract.ts'
import { basePath } from '#server/utils/paths.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'
import LoggerService from '#shared/services/logger.service.ts'

export default class DatabaseService extends DatabaseGateway<Database> {
    public static __container_entry_key = 'DatabaseService'

    public defaultConnection = 'memory'
    public connections: Record<string, any> = {}
    public currentConnection: string | null = null
    public currentConnectionDialectName: string | null = null

    public debug = false
    public logger = new LoggerService()

    public static createTemporatyDatabase() {
        const dialect = new SqliteDialect({ database: new SQLite(':memory:') })

        return new DatabaseService({ dialect })
    }

    public createConnection(dialect: 'sqlite' | 'mysql' | 'memory' | 'postgresql', options: any) {
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

    public static async createDialectFromConnection(connection: Record<string, any>): Promise<Dialect> {
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

        if (connection.dialect === 'memory') {
            dialect = new SqliteDialect({ database: new SQLite(':memory:') })
        }

        if (!dialect) {
            throw new Error(`Unsupported database dialect: ${connection.dialect}`)
        }

        return dialect
    }

    public async createDatabase(connection: Record<string, any>) {
        const dialect = await DatabaseService.createDialectFromConnection(connection)

        const db = new DatabaseService({ dialect: dialect })

        db.currentConnectionDialectName = connection.dialect

        return db
    }

    public async load(connectionName?: string) {

        const name = connectionName || this.defaultConnection
        const connection = this.connections[connectionName || this.defaultConnection]

        if (!connection) {
            throw new Error(`Database connection "${name}" not found in configuration`)
        }

        if (this.currentConnection === name) {
            return
        }

        const db = await this.createDatabase(connection)

        db.currentConnection = name
        db._dialect_identifier = connection.dialect

        if (container.has(DatabaseGateway)) {
            await container.get<DatabaseGateway<any>>(DatabaseGateway).destroy()
        }

        container.set(DatabaseService, db)
        container.set(DatabaseGateway, db)

        this.logger.info('loaded', {
            connection: name,
            dialect: connection.dialect,
        })
    }
}
