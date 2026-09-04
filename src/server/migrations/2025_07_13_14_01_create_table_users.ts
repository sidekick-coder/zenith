import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('users')
        .addIdColumn()
        .addColumn('name', 'varchar(255)')
        .addColumn('username', 'varchar(255)', col => col.notNull())
        .addColumn('email', 'varchar(255)', col => col.notNull())
        .addColumn('password', 'text', col => col.notNull())
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .addUniqueConstraint('users_username_deleted_at_unique', ['username', 'deleted_at'])
        .addUniqueConstraint('users_email_deleted_at_unique', ['email', 'deleted_at'])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute()
}

