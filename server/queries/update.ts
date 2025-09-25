import type { Updateable } from 'kysely'
import type { UpdateFrom, SerializableResult, SerializeOptions } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface UpdateOptions<T extends keyof Database> extends SerializeOptions<T> {
    query?: (qb: UpdateFrom<T>) => UpdateFrom<T>
    values: Updateable<Database[T]>
}

export async function update<T extends keyof Database, O extends UpdateOptions<T>>(table: T, options?: O) {
    const values = options?.values || []
    const query = options?.query 
        ? options.query(db.updateTable(table))
        : db.updateTable(table)

    let rows: any[] = await (query as any).set(values).returningAll()
        .execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as SerializableResult<T, O>[]
}