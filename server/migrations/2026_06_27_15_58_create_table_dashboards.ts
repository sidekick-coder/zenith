import { Kysely } from 'kysely'

const table = 'dashboards'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('description', 'text')
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP').notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP').notNull())
        .addColumn('deleted_at', 'timestamp')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

