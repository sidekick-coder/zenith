import type { Database } from '#server/contracts/database.contract.ts'
import { 
    list,
    paginate,
    find,
    findOrFail,
    exists,
    count,
    create,
    update,
    destroy,
    firstOrCreate, 
    softDelete
} from '#server/queries/index.ts'

import type { 
    ListOptions, 
    PaginateOptions, 
    CountOptions, 
    CreateOptions, 
    UpdateOptions, 
    DestroyOptions, 
    FirstOrCreateOptions,
    SelectFrom,
    SerializeOptions
} from '#server/queries/index.ts'
import type Pagination from '#shared/entities/pagination.entity.ts'

type Constructor = new (...args: any[]) => {}

export interface ModelOptions<T extends keyof Database> extends SerializeOptions<T> {
    select?: (qb: SelectFrom<T>) => SelectFrom<T>
}

export type ModelListOptions<T extends keyof Database> = Omit<ListOptions<T>, 'serialize'>
export type ModelPaginateOptions<T extends keyof Database> = Omit<PaginateOptions<T>, 'serialize'>
export type ModelCountOptions<T extends keyof Database> = CountOptions<T>
export type ModelCreateOptions<T extends keyof Database> = Omit<CreateOptions<T>, 'serialize'>
export type ModelUpdateOptions<T extends keyof Database> = Omit<UpdateOptions<T>, 'serialize'>
export type ModelDestroyOptions<T extends keyof Database> = DestroyOptions<T>
export type ModelFirstOrCreateOptions<T extends keyof Database> = Omit<FirstOrCreateOptions<T>, 'serialize'>

export function Model<Table extends keyof Database>(table: Table) {
    return function ModelExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {
            // 'this' is the concrete constructor (e.g. Food), so the return type is inferred correctly.
            public static paginate<T>(this: new () => T, o?: ModelPaginateOptions<Table>): Pagination<T> {
                return paginate(table, {
                    page: o?.page,
                    limit: o?.limit,
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public static list<T>(this: new () => T, o?: ModelListOptions<Table>): T[] {
                return list(table, {
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public static find<T>(this: new () => T, o?: ModelListOptions<Table>): T | undefined {
                return find(table, {
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public static findOrFail<T>(this: new () => T, o?: ModelListOptions<Table>): T {
                return findOrFail(table, {
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public static exists<T>(this: new () => T, o?: ModelListOptions<Table>): boolean {
                return exists(table, { query: o?.query }) as any
            }

            public static count<T>(this: new () => T, o?: ModelCountOptions<Table>): number {
                return count(table, o) as any
            }

            public static create<T>(this: new () => T, values: ModelCreateOptions<Table>['values']): T | T[] {
                console.log('Creating in table:', table, 'values:', values)
                return create(table, {
                    values: values,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public static update<T>(this: new () => T, o: ModelUpdateOptions<Table>): T[] {
                return update(table, {
                    query: o.query,
                    values: o.values,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public static destroy<T>(this: new () => T, o?: ModelDestroyOptions<Table>): void {
                return destroy(table, o) as any
            }

            public static firstOrCreate<T>(this: new () => T, o: ModelFirstOrCreateOptions<Table>): T {
                return firstOrCreate(table, {
                    select: o.select,
                    values: o.values,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                }) as any
            }

            public async save() {
                await update(table, {
                    query: qb => (qb as any).where('id', '=', (this as any).id),
                    values: this as any,
                })
            }

            public async destroy() {
                await destroy(table, {
                    query: qb => (qb as any).where('id', '=', (this as any).id)
                })
            }

            public async softDelete() {
                const rows = await softDelete(table, {
                    query: qb => (qb as any).where('id', '=', (this as any).id)
                })

                const row = rows[0]

                Object.assign(this as any, row)
            }
        }
    }
}