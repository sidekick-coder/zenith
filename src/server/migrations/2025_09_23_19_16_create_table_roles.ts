import { Kysely } from 'kysely'
import { addSoftDeleteColumn, addTimestampColumns } from '#server/queries/index.ts'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('roles')
        .addIdColumn()
        .addColumn('name', 'varchar(255)', col => col.notNull().unique())
        .addColumn('description', 'text', col => col)
        .addTimestampColumns()
        .addSoftDeleteColumn()
        .execute()

    await db.schema.createTable('user_roles')
        .addIdColumn()
        .addColumn(
            'user_id',
            'integer',
            col => col.notNull()
                .references('users.id')
                .onDelete('cascade')
        )
        .addColumn(
            'role_id',
            'integer',
            col => col
                .notNull()
                .references('roles.id')
                .onDelete('cascade')
        )
        .addUniqueConstraint('user_role_unique', ['user_id', 'role_id'])
        .execute()
    
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('user_roles').execute()
    await db.schema.dropTable('roles').execute()
}

