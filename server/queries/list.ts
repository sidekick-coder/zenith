import type { SelectFrom, SerializeOptions, SerializableResult } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface ListOptions<T extends keyof Database>  extends SerializeOptions<T> {
    query?: (qb: SelectFrom<T>) => SelectFrom<T>
}

export async function list<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O) {
    const query = options?.query 
        ? options.query(db.selectFrom(table)) 
        : db.selectFrom(table).selectAll()

    let rows: any[] = await query.execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as SerializableResult<T, O>[]
}