import { type Dialect, Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import config from '../services/config.service.ts'
import { setDatabase } from './db.ts';

export class DatabaseManager {
    public async load(connectionName?: string) {
        const defaultConnection = config.get('database.default');
        const connections = config.get('database.connections', {});

        const name = connectionName || defaultConnection;

        const connection = connections[name];

        if (!connection) {
            throw new Error(`Database connection "${name}" not found.`);
        }

        let dialect: Dialect | undefined = undefined;

        if (connection.driver === 'sqlite') {
            dialect = new SqliteDialect({
                database: new Database(connection.database)
            });
        }

        if (!dialect) {
            throw new Error(`Unsupported database driver: ${connection.driver}`);
        }

        const db = new Kysely({
            dialect: dialect
        })

        setDatabase(db);
    }

}

const dbManager = new DatabaseManager();

export default dbManager;
