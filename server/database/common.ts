import { CreateTableBuilder, sql  } from 'kysely'
import type { ColumnType, UpdateQueryBuilder } from 'kysely'
import type { Database } from '#server/database/types.ts'

export interface WithTimestamp {
  created_at: ColumnType<Date, string | undefined, never>
  updated_at: ColumnType<Date, string | undefined, Date | string | ReturnType<typeof now>>
}
export interface WithSoftDelete {
  deleted_at: ColumnType<Date | null, never | null | ReturnType<typeof now>, string | null | ReturnType<typeof now>>
}

export const now = ()  => sql`CURRENT_TIMESTAMP`

export const withTimestamps = (ctb: CreateTableBuilder<any, any>) => {
    return ctb
        .addColumn('created_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
        .addColumn('updated_at', 'timestamp', (col) =>  col.defaultTo(now()).notNull())
}

export const withSoftDelete = (ctb: CreateTableBuilder<any, any>) => {
    return ctb.addColumn('deleted_at', 'timestamp')
}