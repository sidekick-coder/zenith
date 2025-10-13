import { Kysely } from 'kysely'

const table = 'user_metas'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('user_id', 'integer', col => col.notNull().references('users.id')
            .onDelete('cascade'))
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('value', 'text')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

