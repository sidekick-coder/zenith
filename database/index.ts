import { Database } from './types.ts' // this is the Database interface we defined earlier
import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'

const dialect = new SqliteDialect({
    database: new SQLite(),
})

export const db = new Kysely<Database>({
    dialect,
})

db.selectFrom('users')
