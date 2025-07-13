 
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

// Base interface that modules can extend
export interface Tables {
  users: UserTable
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Database extends Tables {

  }
}

export {}