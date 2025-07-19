 
import type { WithSoftDelete, WithTimestamp } from '#database/common.ts'
import type { ColumnType, Generated } from 'kysely'

export interface MigrationsTable {
  name: string
  module: string | null
  executed_at: ColumnType<Date, string | undefined, never>
}

export interface UserTable extends WithTimestamp, WithSoftDelete {
  id: Generated<number>
  name: string
  email: string
  password: string
}

// Base interface that modules can extend
export interface Tables {
  users: UserTable
  migrations: MigrationsTable
}


export interface Database  {
  users: UserTable
  migrations: MigrationsTable
}

export {}