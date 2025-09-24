import type { Selectable, Insertable } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface CreateOptions<T extends keyof Database> {
    values: Insertable<Database[T]> | Insertable<Database[T]>[]
    serialize?: (row: Selectable<Database[T]>) => any
}

export type CreateResult<T extends keyof Database, O extends CreateOptions<T> | undefined> =
    O extends undefined ? Selectable<Database[T]>[] :
    O extends { values: infer V; serialize: (row: Selectable<Database[T]>) => infer R } ? 
        V extends any[] ? R[] : R :
    O extends { values: infer V } ? 
        V extends any[] ? Selectable<Database[T]>[] : Selectable<Database[T]> :
    O extends { serialize: (row: Selectable<Database[T]>) => infer R } ? R[] : Selectable<Database[T]>[]

export async function create<T extends keyof Database, O extends CreateOptions<T>>(table: T, options?: O): Promise<CreateResult<T, O>> {
    const values = options?.values || []
    const query = db.insertInto(table).values(values)

    let rows: any[] = await query.returningAll().execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    // Return single object if values was not an array, otherwise return array
    const isArrayInput = Array.isArray(values)
    
    if (!isArrayInput && rows.length > 0) {
        return rows[0] as CreateResult<T, O>
    }

    return rows as CreateResult<T, O>
}