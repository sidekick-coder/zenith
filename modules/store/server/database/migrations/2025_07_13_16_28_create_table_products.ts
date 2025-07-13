import { Kysely } from 'kysely'
import { withSoftDelete, withTimestamps } from '#database/common.ts';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('products')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('description', 'text', col => col.notNull())
        .addColumn('price', 'decimal', col => col.notNull())
        .$call(withTimestamps).$call(withSoftDelete)
        .execute()

}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('products').execute();
}

