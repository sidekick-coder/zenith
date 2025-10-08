import type { Updateable, ExpressionBuilder, ExpressionWrapper } from 'kysely'
import type { UpdateFrom, SerializableResult, SerializeOptions } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface UpdateOptions<T extends keyof Database> extends SerializeOptions<T> {
    values: Updateable<Database[T]>
    where?: (qb: ExpressionBuilder<Database, T>) => ExpressionWrapper<Database, T, any>
    query?: (qb: UpdateFrom<T>) => UpdateFrom<T>
}

export async function updateDefault<T extends keyof Database, O extends UpdateOptions<T>>(table: T, options?: O) {
    const values = options?.values || []
    let query = db.updateTable(table) as any

    if (options?.query) {
        query = options.query(query)
    }

    if (options?.where) {
        query = query.where((eb: any) => options.where!(eb))
    }

    let rows: any[] = await query.set(values).returningAll()
        .execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as SerializableResult<T, O>[]
}

export async function updateMysql<T extends keyof Database, O extends UpdateOptions<T>>(table: T, options?: O) {
    const values = options?.values || []
    const updateQb = db.updateTable(table) as any

    if (options?.where) {
        updateQb.where((eb: any) => options.where!(eb))
    }

    await updateQb.set(values).execute()

    const selectQb = db.selectFrom(table).selectAll() as any

    if (options?.where) {
        selectQb.where((eb: any) => options.where!(eb))
    }

    let rows: any[] = await selectQb.execute()

    if (options?.serialize) {
        rows = rows.map(options.serialize)
    }

    return rows as SerializableResult<T, O>[]
}

export async function update<T extends keyof Database, O extends UpdateOptions<T>>(table: T, options?: O) {
    if (db.driver === 'mysql') {
        return updateMysql(table, options)
    }

    return updateDefault(table, options)
}