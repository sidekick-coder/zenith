import type { Insertable } from 'kysely'
import type { SelectFrom, SerializableResult, SerializeOptions } from './common.ts'
import { list } from './list.ts'
import { create } from './create.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface FirstOrCreateOptions<T extends keyof Database> extends SerializeOptions<T> {
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
    values: Insertable<Database[T]> | Insertable<Database[T]>[]
}

export async function firstOrCreate<T extends keyof Database, O extends FirstOrCreateOptions<T>>(table: T, options?: O) {
    const items = await list(table, { 
        serialize: options?.serialize,  
        query: () => {
            const query: any = options?.select 
                ? options.select(db.selectFrom(table))
                : db.selectFrom(table).selectAll()

            return query.limit(1)
        }
    })

    if (items.length > 0) {
        return items[0] as SerializableResult<T, O>
    }

    const created = await create(table, { 
        serialize: options?.serialize,
        values: options?.values as any
    })

    return created as SerializableResult<T, O>
}