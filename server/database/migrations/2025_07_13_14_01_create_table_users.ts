import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('users')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('name', 'text')
        .addColumn('username', 'text', col => col.notNull())
        .addColumn('email', 'text', col => col.notNull())
        .addColumn('password', 'text', col => col.notNull())
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('deleted_at', 'timestamp')
        .addUniqueConstraint('users_username_deleted_at_unique', ['username', 'deleted_at'])
        .addUniqueConstraint('users_email_deleted_at_unique', ['email', 'deleted_at'])
        .execute()

    // Add a partial unique index so usernames are unique only if deleted_at IS NULL
    await db.schema
        .createIndex('users_username_unique_active')
        .unique()
        .on('users')
        .columns(['username', 'deleted_at'])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute()
}

