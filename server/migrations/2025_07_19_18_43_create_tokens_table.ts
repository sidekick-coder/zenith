import { Kysely } from 'kysely'
import { addTimestampColumns } from '#server/queries/index.ts'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('tokens')
        .addIdColumn()
        .addColumn('user_id', 
            'integer', 
            col => col
                .notNull()
                .references('users.id')
                .onDelete('cascade')
        )
        .addColumn('token', 'varchar(255)', col => col.notNull().unique())
        .addColumn('type', 'varchar(255)', col => col.notNull().defaultTo('auth'))
        .addColumn('expires_at', 'timestamp')
        .$call(addTimestampColumns)
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('tokens').execute()
}

