import { Kysely } from 'kysely'

const table = 'oauth_tokens'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('user_id', 'integer', 
            col => col
                .references('users.id')
                .onDelete('cascade')
        )
        .addColumn('provider', 'varchar(80)')
        .addColumn('action', 'varchar(80)', col => col.notNull())
        .addColumn('token', 'varchar(255)', col => col.notNull().unique())
        .addColumn('expires_at', 'timestamp')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

