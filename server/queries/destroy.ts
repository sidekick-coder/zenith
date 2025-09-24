import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'

type DeleteFrom<T extends keyof Database> = ReturnType<typeof db.deleteFrom<T>>

export interface ListOptions<T extends keyof Database> {
    query?: (qb: DeleteFrom<T>) => DeleteFrom<T>
}

export async function destroy<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O) {
    const query = options?.query 
        ? options.query(db.deleteFrom(table)) 
        : db.deleteFrom(table)

    await query.execute()
}