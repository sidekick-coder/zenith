import { Kysely } from 'kysely'
import { addTimestampColumns } from '#server/queries/index.ts'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('tokens')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('user_id', 
            'integer', 
            col => col
                .notNull()
                .references('users.id')
                .onDelete('cascade')
        )
        .addColumn('token', 'text', col => col.notNull().unique())
        .addColumn('type', 'text', col => col.notNull().defaultTo('auth'))
        .addColumn('expires_at', 'timestamp')
        .$call(addTimestampColumns)
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('tokens').execute()
}

