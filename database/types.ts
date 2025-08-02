 
import type { ColumnType, Generated } from 'kysely'
import type { WithSoftDelete, WithTimestamp } from '#database/common.ts'

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

// Base interface that modules can extend
export interface Tables {
  users: UserTable
  tokens: TokenTable
  migrations: MigrationsTable
}


export interface Database  {
  users: UserTable
  tokens: TokenTable
  migrations: MigrationsTable
}

export {}