import { Kysely } from 'kysely'

const table = 'dashboard_metas'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('dashboard_id', 'integer', (col) => col.notNull()
            .references('dashboards.id')
            .onDelete('cascade')
        )
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('value', 'text')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

