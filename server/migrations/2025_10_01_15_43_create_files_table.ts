import { Kysely } from 'kysely'

const table = 'files'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('private', 'boolean', col => col.notNull().defaultTo(true))
        .addColumn('drive', 'varchar(80)', col => col.notNull())
        .addColumn('mimetype', 'varchar(255)', col => col.notNull())
        .addColumn('client_name', 'varchar(255)', col => col.notNull())
        .addColumn('filename', 'text', col => col.notNull())
        .addColumn('origin', 'varchar(255)')
        .addColumn('purpose', 'varchar(255)')
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

