import { Kysely } from 'kysely'
import { withSoftDelete, withTimestamps } from '#server/database/common.ts'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('users')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('name', 'text')
        .addColumn('username', 'text', col => col.notNull())
        .addColumn('email', 'text', col => col.notNull())
        .addColumn('password', 'text', col => col.notNull())
        .$call(withTimestamps)
        .$call(withSoftDelete)
        .addUniqueConstraint('users_username_deleted_at_unique', ['username', 'deleted_at'])
        .addUniqueConstraint('users_email_deleted_at_unique', ['email', 'deleted_at'])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute()
}

