import type { Insertable } from 'kysely'
import type { SelectFrom, SerializableResult, SerializeOptions, UpdateFrom } from './common.ts'
import { list } from './list.ts'
import { create } from './create.ts'
import { update } from './update.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface UpdateOrCreateOptions<T extends keyof Database> extends SerializeOptions<T> {
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
    update?: (qb: UpdateFrom<T>) => UpdateFrom<T>
    values: Insertable<Database[T]> | Insertable<Database[T]>[]
}

export async function updateOrCreate<T extends keyof Database, O extends UpdateOrCreateOptions<T>>(table: T, options?: O) {
    const items = await list(table, { 
        serialize: options?.serialize,  
        query: () => {
            const query: any = options?.select 
                ? options.select(db.selectFrom(table))
                : db.selectFrom(table).selectAll()

            return query.limit(1)
        }
    })

    const item = items[0]

    if (item) {
        return update(table, { 
            serialize: options?.serialize,
            values: options?.values as any,
            where: () => {
                const query = options?.update 
                    ? options.update(db.updateTable(table))
                    : db.updateTable(table)

                return query.limit(1)
            }
        }) as SerializableResult<T, O>
    }

    const created = await create(table, { 
        serialize: options?.serialize,
        values: options?.values as any
    })

    return created as SerializableResult<T, O>
}