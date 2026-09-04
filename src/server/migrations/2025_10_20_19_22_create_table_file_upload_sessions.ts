import { Kysely } from 'kysely'

const table = 'file_upload_sessions'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('purpose', 'varchar(255)', col => col.notNull())
        .addColumn('mime_types', 'text', col => col.notNull())
        .addColumn('max_size', 'integer', col => col.notNull())
        .addColumn('expires_at', 'timestamp', col => col.notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

