import { Kysely } from 'kysely'
import { withTimestamps } from '../common.ts'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('tokens')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('user_id', 'integer', col => col.notNull().references('users.id'))
        .addColumn('token', 'text', col => col.notNull().unique())
        .addColumn('type', 'text', col => col.notNull().defaultTo('auth'))
        .addColumn('expires_at', 'timestamp')
        .$call(withTimestamps)
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('tokens').execute()
}

