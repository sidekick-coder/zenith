import { withSoftDelete, withTimestamps } from '#database/common.ts'
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('tasks')
        .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
        .addColumn('title', 'varchar', (col) => col.notNull())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('status', 'varchar', (col) => col.notNull())
        .$call(withTimestamps)
        .$call(withSoftDelete)
        .execute()

}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('tasks').execute()
}

