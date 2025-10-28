 
import type { ColumnType, Generated } from 'kysely'
import type { SoftDeleteTable, TimestampTable } from '#server/queries/index.ts'

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

export interface UserMetaTable extends TimestampTable, SoftDeleteTable {
  id: Generated<number>
  user_id: number
  name: string
  value: string | null
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
  description: string | null
}

export interface UserRoleTable {
  user_id: number
  role_id: number
}

export interface PermissionTable extends TimestampTable, SoftDeleteTable {
  id: Generated<number>
  name: string
  description: string | null
  origin: string
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

export interface FileTable extends TimestampTable, SoftDeleteTable {
  id: Generated<number>
  drive: string
  mimetype: string
  client_name: string
  filename: string
  purpose: string
  public: boolean
}

export interface FileMetaTable extends TimestampTable, SoftDeleteTable {
  id: Generated<number>
  file_id: number
  name: string
  value: string | null
}

export interface UploadSessionTable {
  id: Generated<number>
  purpose: string
  mime_types: string
  max_size: number
  expires_at: string
}

export interface JobTable extends TimestampTable {
  id: string
  queue_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  data: string | null
  result: string | null
  error: string | null
}

export interface Database  {
  users: UserTable
  user_metas: UserMetaTable
  tokens: TokenTable
  migrations: MigrationsTable
  files: FileTable
  file_metas: FileMetaTable
  file_upload_sessions: UploadSessionTable
  
  roles: RoleTable
  user_roles: UserRoleTable

  permissions: PermissionTable
  permissions_assignments: PermissionAssignmentTable

  jobs: JobTable
}

export {}