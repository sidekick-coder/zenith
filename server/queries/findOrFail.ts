import { list  } from './list.ts'
import type { ListOptions } from './list.ts'
import type { Database } from '#server/contracts/database.contract.ts'

export async function findOrFail<T extends keyof Database, O extends ListOptions<T>>(table: T, options?: O) {
    const rows = await list(table, options)

    const found = rows[0]

    if (!found) {
        throw new Error('Record not found')
    }

    return found
}