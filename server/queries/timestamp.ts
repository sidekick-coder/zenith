import { CreateTableBuilder  } from 'kysely'
import type { ColumnType } from 'kysely'
import { now } from './common.ts'

export interface TimestampTable {
  created_at: ColumnType<Date, string | undefined, never>
  updated_at: ColumnType<Date, string | undefined, Date | string | ReturnType<typeof now>>
}

export const addTimestampColumns = (ctb: CreateTableBuilder<any, any>) => {
    return ctb
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}
