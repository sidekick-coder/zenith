import type { Database } from '#server/contracts/database.contract.ts'
import { list, paginate } from '#server/queries/index.ts'
import type { ListOptions, PaginateOptions  } from '#server/queries/index.ts'


export interface ModelOptions<T extends keyof Database> extends SerializeOptions<T> {
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
}

export type ModelListOptions<T extends keyof Database> = Omit<ListOptions<T>, 'serialize'>
export type ModelPaginateOptions<T extends keyof Database> = Omit<PaginateOptions<T>, 'serialize'>

export function Model<Table extends keyof Database>(table: Table) {
    return function ModelExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {
            // 'this' is the concrete constructor (e.g. Food), so the return type is inferred correctly.
            public static paginate<T>(this: new () => T, o: ModelPaginateOptions<Table>): T[] {
                return paginate(table, {
                    page: o.page,
                    limit: o.limit,
                    query: o.query,
                    serialize: row => {
                        const instance = new Base() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public static list<T>(this: new () => T, o: ModelListOptions<Table>): T[] {
                return list(table, {
                    query: o.query,
                    serialize: row => {
                        const instance = new Base() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }
        }
    }
}