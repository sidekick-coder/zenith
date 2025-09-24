import type { Selectable } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

type SelectFrom<T extends keyof Database> = ReturnType<typeof db.selectFrom<T>>

export interface ListOptions<T extends keyof Database> {
    serialize?: (row: Selectable<Database[T]>) => any
    query?: (qb: SelectFrom<T>) => SelectFrom<T>
}

export type ListResult<T extends keyof Database, O extends ListOptions<T> | undefined> =
    O extends undefined ? Selectable<Database[T]>[] :
    O extends { serialize: (row: Selectable<Database[T]>) => infer R } ? R[] : Selectable<Database[T]>[]

export async function list<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O): Promise<ListResult<T, O>> {
    const query = options?.query 
        ? options.query(db.selectFrom(table)) 
        : db.selectFrom(table).selectAll()

    let rows: any[] = await query.execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as ListResult<T, O>
}