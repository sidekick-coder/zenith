import type { SelectFrom, SerializableResult, SerializeOptions } from './common.ts'
import { list } from './list.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import type { ExpressionBuilder, ExpressionWrapper } from 'kysely'

export interface FindOneOptions<T extends keyof Database> extends SerializeOptions<T> {
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
}

export async function findOne<T extends keyof Database, O extends FindOneOptions<T>>(table: T, options?: O) {
    const query = db.selectFrom(table).selectAll() as any

    if (options?.where) {
        query.where((eb: any) => options.where!(eb))
    }

    const row: any = await query.limit(1).executeTakeFirst()

    if (!row) {
        return null
    }

    if (options?.serialize) {
        return options.serialize(row) as SerializableResult<T, O>
    }

    return row as SerializableResult<T, O>
}

export async function findOneOrFail<T extends keyof Database, O extends FindOneOptions<T>>(table: T, options?: O) {
    const found = await findOne(table, options)

    if (!found) {
        throw new Error('Record not found')
    }

    return found
}