import { Kysely } from 'kysely'

const table = 'table_name'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

