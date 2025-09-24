import {  sql  } from 'kysely'
import type { Selectable } from 'kysely'
import db from '#server/facades/db.facade.ts'
import type { Database } from '#server/contracts/database.contract.ts'

export type SelectFrom<T extends keyof Database> = ReturnType<typeof db.selectFrom<T>>

export const now = ()  => sql`CURRENT_TIMESTAMP`

export interface SerializeOptions<T extends keyof Database> {
    serialize?: (row: Selectable<Database[T]>) => any
}

export type SerializableResult<T extends keyof Database, O extends SerializeOptions<T> | undefined> =
    O extends undefined ? Selectable<Database[T]> :
    O extends { serialize: (row: Selectable<Database[T]>) => infer R } ? R : Selectable<Database[T]>