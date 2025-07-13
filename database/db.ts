
import SQLite from 'better-sqlite3'
import {  Kysely, SqliteDialect } from 'kysely'

let _db: Kysely<Database> = new Kysely<Database>({
    dialect:new SqliteDialect({
        database: new SQLite(':memory:'),
    })
})

// db proxy 
export const db = new Proxy({} as Kysely<Database>, {
    get(_target, prop) {
        if (!_db) {
            throw new Error('Database connection not initialized. Call load() first.')
        }
        
        const value = (_db as any)[prop]
        
        if (typeof value === 'function') {
            return value.bind(_db)
        }

        return value
    }
})

export async function setDatabase(database: Kysely<any>) {
    if(_db) {
        await _db.destroy();
    }

    _db = database;
}
