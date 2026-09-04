import { Kysely } from 'kysely'

const table = 'email_template_metas'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('template_id', 'integer', (col) => col
            .notNull()
            .references('email_templates.id')
            .onDelete('cascade')
        )
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('value', 'text', (col) => col.notNull())
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

