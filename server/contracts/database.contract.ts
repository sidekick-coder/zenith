 
import type { ColumnType, Generated } from 'kysely'
import type { WithSoftDelete, WithTimestamp } from '#server/database/common.ts'

export interface MigrationsTable {
  name: string
  module: string | null
  executed_at: ColumnType<Date, string | undefined, never>
}

export interface UserTable extends WithTimestamp, WithSoftDelete {
  id: Generated<number>
  name: string
  username: string
  email: string
  password: string
}

export interface TokenTable extends WithTimestamp {
  id: Generated<number>
  user_id: number
  token: string
  type: string
  expires_at: string | null
}

export interface RoleTable {
  id: Generated<number>
  name: string
}

export interface UserRoleTable {
  user_id: number
  role_id: number
}

export interface PermissionTable {
  id: Generated<number>
  subject: string
  action: string
  conditions: string
}

export interface PermissionAssignmentTable {
  id: Generated<number>
  permission_id: number
  assignable_type: string
  assignable_id: string
}

export interface UserPermissionTable {
  user_id: number
  permission_id: number
}

export interface Database  {
  users: UserTable
  tokens: TokenTable
  migrations: MigrationsTable
  roles: RoleTable
  user_roles: UserRoleTable
  permissions: PermissionTable
  permissions_assignments: PermissionAssignmentTable
  user_permissions: UserPermissionTable
}

export {}