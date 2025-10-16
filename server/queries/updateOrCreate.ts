import type { ExpressionBuilder, ExpressionWrapper, Insertable } from 'kysely'
import type { SelectFrom, SerializableResult, SerializeOptions, UpdateFrom } from './common.ts'
import { list } from './list.ts'
import { create } from './create.ts'
import { update } from './update.ts'
import { findOne } from './findOne.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface UpdateOrCreateOptions<T extends keyof Database> extends SerializeOptions<T> {
    where: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
    update?: (qb: UpdateFrom<T>) => UpdateFrom<T>
    values: Insertable<Database[T]> | Insertable<Database[T]>[]
}

export async function updateOrCreate<T extends keyof Database, O extends UpdateOrCreateOptions<T>>(table: T, options?: O) {
    const item = await findOne(table, { 
        serialize: options?.serialize,  
        where: options?.where,
    })

    if (item) {
        return update(table, { 
            serialize: options?.serialize,
            values: options?.values as any,
            where: options?.where
        }) as SerializableResult<T, O>
    }

    const created = await create(table, { 
        serialize: options?.serialize,
        values: options?.values as any
    })

    return created as SerializableResult<T, O>
}