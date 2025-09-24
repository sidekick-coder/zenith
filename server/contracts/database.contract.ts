 
import type { ColumnType, Generated } from 'kysely'
import { SoftDeleteTable, TimestampTable } from '#server/queries/index.ts'

export interface MigrationsTable {
  name: string
  module: string | null
  executed_at: ColumnType<Date, string | undefined, never>
}

export interface UserTable extends TimestampTable, SoftDeleteTable {
  id: Generated<number>
  name: string
  username: string
  email: string
  password: string
}

export interface TokenTable extends TimestampTable {
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

export interface PermissionTable extends TimestampTable, SoftDeleteTable {
  id: Generated<number>
  name: string
  subject: string
  action: string
  conditions: string | null
}

export interface PermissionAssignmentTable {
  id: Generated<number>
  permission_id: number
  assignable_type: string
  assignable_id: string
}

export interface Database  {
  users: UserTable
  tokens: TokenTable
  migrations: MigrationsTable
  
  roles: RoleTable
  user_roles: UserRoleTable

  permissions: PermissionTable
  permissions_assignments: PermissionAssignmentTable
}

export {}