import type { Selectable } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface ListOptions<T extends keyof Database> {
    serialize?: (row: Selectable<Database[T]>) => any
}

export type ListResult<T extends keyof Database, O extends ListOptions<T> | undefined> =
    O extends undefined ? Selectable<Database[T]>[] :
    O extends { serialize: (row: Selectable<Database[T]>) => infer R } ? R[] : Selectable<Database[T]>[]

export async function list<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O): Promise<ListResult<T, O>> {
    let rows: any[] = await db.selectFrom(table).selectAll()
        .execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as ListResult<T, O>
}