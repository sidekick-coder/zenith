import { Kysely } from 'kysely'

const table = 'oauth_accounts'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable(table)
        .addIdColumn()
        .addColumn('user_id', 
            'integer', 
            col => col
                .notNull()
                .references('users.id')
                .onDelete('cascade')
        )
        .addColumn('provider', 'varchar(255)', col => col.notNull())
        .addColumn('provider_user_id', 'varchar(255)', col => col.notNull())
        .addColumn('provider_user_email', 'varchar(255)')
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}

