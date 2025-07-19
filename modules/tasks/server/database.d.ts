// Blog module database types
import type { WithSoftDelete, WithTimestamp } from '#database/common.ts'
import type { Generated } from 'kysely'

export interface TaskTable extends WithTimestamp, WithSoftDelete {
  id: Generated<number>
  title: string
  description?: string
  status: string
}

// Extend the global DatabaseTables interface
declare module '#database/types' {
  interface Database {
    tasks: TaskTable
  }
}

export {}