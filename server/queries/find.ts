import type { SelectFrom, SerializableResult, SerializeOptions } from './common.ts'
import { list } from './list.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface FindOptions<T extends keyof Database> extends SerializeOptions<T> {
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
}

export async function find<T extends keyof Database, O extends FindOptions<T>>(table: T, options?: O) {
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

    return null
}