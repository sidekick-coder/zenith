import { updateOrCreate } from '#server/queries/index.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import type { Constructor } from '#shared/utils/compose.ts'

export function Metadata<Table extends keyof Database>(metasTable: Table, foreignKey: keyof Database[Table]) {
    return function MetadataExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {
            public async get<T = any>(name: string): Promise<T | undefined>
            public async get<T = any>(name: string, defaultValue: T): Promise<T>
            public async get<T = any>(name: string, defaultValue?: T): Promise<T | undefined> {
                const constructor = this.constructor as any

                const table = constructor.__model?.table
                const primaryKey = constructor.__model?.primaryKey

                if (!table || !primaryKey) {
                    throw new Error('Should use Model mixin before Metadata')
                }

                let query = db.selectFrom(metasTable) as any

                query = query
                    .selectAll()
                    .where((foreignKey as string), '=', (this as any)[primaryKey])
                    .where('name', '=', name)
                    .limit(1)

                const row = await query.executeTakeFirst() 

                if (!row || !row.value) {
                    return defaultValue
                }

                let value = row?.value

                if (typeof value === 'string' && value.startsWith('json:')) {
                    value = JSON.parse(value.slice(5))
                }

                return value as T
            }

            public async set(name: string, value: any): Promise<void> {
                const constructor = this.constructor as any

                const table = constructor.__model?.table
                const primaryKey = constructor.__model?.primaryKey

                if (!table || !primaryKey) {
                    throw new Error('Should use Model mixin before Metadata')
                }

                const values = {
                    [foreignKey]: (this as any)[primaryKey],
                    name,
                    value
                }

                if (typeof value === 'object') {
                    values.value = `json:${JSON.stringify(value)}`
                }

                await updateOrCreate(metasTable, {
                    values: values as any,
                    where: (qb: any) => qb.and([
                        qb.eb((foreignKey as string), '=', (this as any)[primaryKey]),
                        qb.eb('name', '=', name)
                    ])
                })
            }
        }
    }
}