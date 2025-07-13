 
import type {
    ColumnType,
    Generated,
} from 'kysely'

export interface UserTable {
  id: Generated<number>
  name: string
  email: string
  password: string
  created_at: ColumnType<Date, string | undefined, never>
  updated_at: ColumnType<Date, string | undefined, never>
  deleted_at: ColumnType<Date | null, string | undefined, null>
}

export interface MigrationsTable {
  name: string
  module: string | null
  executed_at: ColumnType<Date, string | undefined, never>
}

// Base interface that modules can extend
export interface Tables {
  users: UserTable
  migrations: MigrationsTable
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Database extends Tables {

  }
}

export {}