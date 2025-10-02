import type { UpdateOrCreateOptions } from '#modules/callory-tracker/root/server/queries/updateOrCreate.ts'
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
    updateOrCreate,
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
export type ModelUpdateOrCreateOptions<T extends keyof Database> = Omit<UpdateOrCreateOptions<T>, 'serialize'>

export function Model<Table extends keyof Database>(table: Table) {
    return function ModelExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {

            constructor(...args: any[]) {
                super(...args)
                
                if (typeof (this.constructor as any).boot === 'function') {
                    (this.constructor as any).boot.apply(this.constructor)
                }
            }

            public static table = table
            public static listeners = [] as Array<(...args: any[]) => void>
            public static on(event: string, listener: (...args: any[]) => void) {
                const constructor = this as any
                
                const listeners = constructor.listeners || []

                listeners.push({ 
                    event,
                    listener 
                })

                constructor.listeners = listeners
            }
            public static async emit(event: string, ...args: any[]) {
                const constructor = this as any
                
                const listeners = constructor.listeners || []

                for await (const l of listeners.filter((l: any) => l.event === event)) {
                    await l.listener(...args)
                }
            }
            
            // 'this' is the concrete constructor (e.g. Food), so the return type is inferred correctly.
            public static async paginate<T>(this: new () => T, o?: ModelPaginateOptions<Table>): Promise<Pagination<T>> {
                const constructor = this as any

                const pagination = await paginate(table, {
                    page: o?.page,
                    limit: o?.limit,
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                })

                for await (const item of pagination.items) {
                    await constructor.emit.bind(constructor)('serialized', item)
                }

                return pagination as any
            }

            public static async list<T>(this: new () => T, o?: ModelListOptions<Table>): Promise<T[]> {
                const contructor = this as any 

                const items = await list(table, {
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                })

                for await (const item of items) {
                    await contructor.emit.bind(contructor)('serialized', item)
                }

                return items as any
            }

            public static async find<T>(this: new () => T, o?: ModelListOptions<Table>): Promise<T | undefined> {
                const contructor = this as any

                const row = await find(table, {
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                })

                if (row) {
                    await contructor.emit.bind(contructor)('serialized', row)
                }

                return row as any
            }

            public static async findOrFail<T>(this: new () => T, o?: ModelListOptions<Table>): Promise<T> {
                const contructor = this as any

                const row = await findOrFail(table, {
                    query: o?.query,
                    serialize: row => {
                        const instance = new this() as any
                        
                        Object.assign(instance as any, row)

                        return instance
                    },
                })

                await contructor.emit.bind(contructor)('serialized', row)

                return row as any
            }

            public static exists<T>(this: new () => T, o?: ModelListOptions<Table>): boolean {
                return exists(table, { query: o?.query }) as any
            }

            public static count<T>(this: new () => T, o?: ModelCountOptions<Table>): number {
                return count(table, o) as any
            }

            public static create<T>(this: new () => T, values: ModelCreateOptions<Table>['values']): T {
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

            public static updateOrCreate<T>(this: new () => T, o: ModelUpdateOrCreateOptions<Table>): T {
                return updateOrCreate(table, {
                    select: o.select,
                    update: o.update,
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