import { Kysely } from 'kysely'
import { withSoftDelete, withTimestamps } from '../common.ts';

export async function up(db: Kysely<any>): Promise<void> {
    db.schema.createTable('users')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('username', 'text', col => col.notNull().unique())
        .addColumn('email', 'text', col => col.notNull())
        .addColumn('password', 'text', col => col.notNull())
        .$call(withTimestamps)
        .$call(withSoftDelete)
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute();
}

