import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('roles')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('name', 'varchar(255)', col => col.notNull().unique())
        .execute()

    await db.schema.createTable('user_roles')
        .addColumn('user_id', 'integer', col => col.notNull())
        .addColumn('role_id', 'integer', col => col.notNull())
        .addForeignKeyConstraint('user_roles_user_id_foreign', ['user_id'], 'users', ['id'])
        .addForeignKeyConstraint('user_roles_role_id_foreign', ['role_id'], 'roles', ['id'])
        .addPrimaryKeyConstraint('user_roles_pkey', ['user_id', 'role_id'])
        .execute()
    
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('user_roles').execute()
    await db.schema.dropTable('roles').execute()
}

