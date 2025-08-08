import { CreateTableBuilder, sql  } from 'kysely'
import type { ColumnType, Generated } from 'kysely'

export interface WithTimestamp {
  created_at: ColumnType<Date, string, never>
  updated_at: ColumnType<Date, string, Date | string>
}
export interface WithSoftDelete {
  deleted_at: ColumnType<Date | null, string | null, string | null>
}

export const withTimestamps = (ctb: CreateTableBuilder<any, any>) => {
    return ctb
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
}

export const withSoftDelete = (ctb: CreateTableBuilder<any, any>) => {
    return ctb.addColumn('deleted_at', 'timestamp')
}