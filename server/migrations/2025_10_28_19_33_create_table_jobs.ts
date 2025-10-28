import { Kysely } from 'kysely'

const table = 'jobs'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addColumn('id', 'varchar(36)', (col) => col.primaryKey())
        .addColumn('status', 'varchar(20)', (col) => col.notNull())
        .addColumn('queue_id', 'varchar(100)', (col) => col.notNull())
        .addColumn('data', 'text')
        .addColumn('result', 'text')
        .addColumn('error', 'text')
        .addTimestampColumns()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

