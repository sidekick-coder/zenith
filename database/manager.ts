import {   SqliteDialect } from 'kysely'
import type { Dialect } from 'kysely'
import { Kysely } from 'kysely'
import SQLite from 'better-sqlite3'
import logger from '../logger.ts'
import type { Database } from './types'
import config from '#services/config.service.ts'
import di from '#facades/di.ts'

// In-memory SQLite dialect for initialization
// This is used to create the Kysely instance before loading the actual database connection
const memory = new SqliteDialect({ database: new SQLite(':memory:') })

export default class DatabaseManager extends Kysely<Database> {
    public static readonly DI_KEY = 'db'
    public configConnectionName = 'initial'
    public configConnection = ''


    constructor(kyselyConfig?: { dialect: Dialect }) {
        const config = kyselyConfig || { dialect: memory }
        
        super(config)
    }

    public async load(connectionName?: string) {
        const defaultConnection = config.get('database.default')
        const connections = config.get('database.connections', {})

        const name = connectionName || defaultConnection

        const connection = connections[name]

        if (!connection) {
            throw new Error(`Database connection "${name}" not found.`)
        }

        let dialect: Dialect | undefined = undefined

        if (connection.driver === 'sqlite') {
            dialect = new SqliteDialect({ database: new SQLite(connection.database) })
        }

        if (!dialect) {
            throw new Error(`Unsupported database driver: ${connection.driver}`)
        }

        const db = new DatabaseManager({ dialect: dialect })

        db.configConnectionName = name
        db.configConnection = connection.database

        if (di.has(DatabaseManager.DI_KEY)) {
            await di.get<DatabaseManager>(DatabaseManager.DI_KEY).destroy()
        }

        di.set(DatabaseManager.DI_KEY, db)
        logger.info(`connection "${name}" loaded.`, { label: 'db' })
    }
}