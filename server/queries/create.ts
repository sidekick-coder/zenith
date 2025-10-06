import type { Insertable } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import type { SerializableResult, SerializeOptions } from './common.ts'

export interface CreateOptions<T extends keyof Database> extends SerializeOptions<T> {
    values: Insertable<Database[T]> | Insertable<Database[T]>[]
    primaryKey?: string // default 'id'
}


export async function createDefault<T extends keyof Database, O extends CreateOptions<T>>(table: T, options?: O) {
    const values = options?.values || []
    const insert = db.insertInto(table).values(values)

    let row: any = await insert.returningAll().executeTakeFirst()

    if (options?.serialize) {
        row = options.serialize(row)
    }

    return row as SerializableResult<T, O>
}

export async function createMysql<T extends keyof Database, O extends CreateOptions<T>>(table: T, options?: O) {
    const values = options?.values || []
    const insert = db.insertInto(table).values(values)

    const primaryKey = (options?.primaryKey || 'id') as keyof Database[T]

    let result = await insert.executeTakeFirst()

    const resultId = result.insertId as any

    const select = db.selectFrom(table).selectAll() as any

    let row = await select
        .where(primaryKey, '=', resultId)
        .executeTakeFirst()

    if (options?.serialize) {
        row = options.serialize(row)
    }

    return row as SerializableResult<T, O>
}


export async function create<T extends keyof Database, O extends CreateOptions<T>>(table: T, options?: O) {
    if (db.driver === 'mysql') {
        return createMysql(table, options)
    }

    return createDefault(table, options)
}