import { Kysely } from 'kysely'
import { addSoftDeleteColumn, addTimestampColumns } from '#server/queries/index.ts'

const table = 'files'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addColumn('id', 'integer', col => col.autoIncrement().primaryKey())
        .addColumn('drive', 'varchar(80)', col => col.notNull())
        .addColumn('mimetype', 'varchar(255)', col => col.notNull())
        .addColumn('client_name', 'varchar(255)', col => col.notNull())
        .addColumn('filename', 'text', col => col.notNull())
        .addColumn('metadata', 'text')
        .$call(addTimestampColumns)
        .$call(addSoftDeleteColumn)
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

