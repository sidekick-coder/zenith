import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createTable('roles')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('subject', 'varchar(255)', col => col.notNull())
        .addColumn('action', 'varchar(255)', col => col.notNull())
        .addColumn('conditions', 'text', col => col.notNull())
        .execute()

    await db.schema.createTable('user_roles')
        .addColumn('user_id', 'integer', col => col.notNull())
        .addColumn('role_id', 'integer', col => col.notNull())
        .addForeignKeyConstraint('user_roles_user_id_foreign', ['user_id'], 'users', ['id'])
        .addForeignKeyConstraint('user_roles_role_id_foreign', ['role_id'], 'roles', ['id'])
        .addPrimaryKeyConstraint('user_roles_pkey', ['user_id', 'role_id'])
        .execute()

    await db.schema.createTable('permissions')
        .addColumn('id', 'integer', col => col.primaryKey())
        .addColumn('name', 'text', col => col.notNull())
        .execute()

    await db.schema.createTable('role_permissions')
        .addColumn('role_id', 'integer', col => col.notNull())
        .addColumn('permission_id', 'integer', col => col.notNull())
        .addForeignKeyConstraint('role_permissions_role_id_foreign', ['role_id'], 'roles', ['id'])
        .addForeignKeyConstraint('role_permissions_permission_id_foreign', ['permission_id'], 'permissions', ['id'])
        .addPrimaryKeyConstraint('role_permissions_pkey', ['role_id', 'permission_id'])
        .execute()

    await db.schema.createTable('user_permissions')
        .addColumn('user_id', 'integer', col => col.notNull())
        .addColumn('permission_id', 'integer', col => col.notNull())
        .addForeignKeyConstraint('user_permissions_user_id_foreign', ['user_id'], 'users', ['id'])
        .addForeignKeyConstraint('user_permissions_permission_id_foreign', ['permission_id'], 'permissions', ['id'])
        .addPrimaryKeyConstraint('user_permissions_pkey', ['user_id', 'permission_id'])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('role_permissions').execute()
    await db.schema.dropTable('user_permissions').execute()
    await db.schema.dropTable('permissions').execute()
    await db.schema.dropTable('user_roles').execute()
    await db.schema.dropTable('roles').execute()
}

