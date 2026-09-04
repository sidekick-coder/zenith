import { Kysely } from 'kysely'

const table = 'file_metas'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('file_id', 'integer', col => col.notNull()
            .references('files.id')
            .onDelete('cascade')
        )
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('value', 'text')
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

