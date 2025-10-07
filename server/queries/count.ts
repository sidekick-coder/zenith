import type { SelectFrom } from './common.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

export interface CountOptions<T extends keyof Database> {
    query?: (qb: SelectFrom<T>) => SelectFrom<T>
}

export async function count<T extends keyof Database, O extends CountOptions<T>>(table: T, options?: O): Promise<number> {
    const query = options?.query 
        ? options.query(db.selectFrom(table)) 
        : db.selectFrom(table)

    const row = await (query as any)
        .clearSelect()
        .select((eb: any) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

    return Number(row?.count ?? 0)
}