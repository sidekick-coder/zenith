import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('permissions')
        .addIdColumn()
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('origin', 'varchar(50)', col => col.notNull().defaultTo('custom'))
        .addColumn('subject', 'varchar(255)', col => col.notNull())
        .addColumn('action', 'varchar(255)', col => col.notNull())
        .addColumn('conditions', 'text')
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()

    await db.schema.createTable('permissions_assignments')
        .addIdColumn()
        .addColumn(
            'permission_id',
            'integer', 
            col => col
                .notNull()
                .references('permissions.id')
                .onDelete('cascade')
        )
        .addColumn('assignable_type', 'varchar(50)', col => col.notNull())
        .addColumn('assignable_id', 'varchar(255)', col => col.notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('permissions_assignments').execute()
    await db.schema.dropTable('permissions').execute()
}

