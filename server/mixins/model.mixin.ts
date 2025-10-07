import { emitHook } from './hooks.mixin.ts'
import type { UpdateOrCreateOptions } from '#modules/callory-tracker/root/server/queries/updateOrCreate.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import * as queries from '#server/queries/index.ts'

import type { 
    ListOptions, 
    PaginateOptions, 
    CountOptions, 
    CreateOptions, 
    UpdateOptions, 
    DestroyOptions, 
    FirstOrCreateOptions,
} from '#server/queries/index.ts'
import type Pagination from '#shared/entities/pagination.entity.ts'
import type { Constructor } from '#shared/utils/compose.ts'

export type ModelListOptions<T extends keyof Database> = Omit<ListOptions<T>, 'serialize'>
export type ModelPaginateOptions<T extends keyof Database> = Omit<PaginateOptions<T>, 'serialize'>
export type ModelCountOptions<T extends keyof Database> = CountOptions<T>
export type ModelCreateOptions<T extends keyof Database> = Omit<CreateOptions<T>, 'serialize'>
export type ModelUpdateOptions<T extends keyof Database> = Omit<UpdateOptions<T>, 'serialize'>
export type ModelDestroyOptions<T extends keyof Database> = DestroyOptions<T>
export type ModelFirstOrCreateOptions<T extends keyof Database> = Omit<FirstOrCreateOptions<T>, 'serialize'>
export type ModelUpdateOrCreateOptions<T extends keyof Database> = Omit<UpdateOrCreateOptions<T>, 'serialize'>

export function Model<Table extends keyof Database>(table: Table, primaryKey: keyof Database[Table] = 'id' as any) {
    return function ModelExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {            
            public static serialize<T>(this: new () => T, row: any): Promise<T> {
                const instance = new this() as any

                Object.assign(instance as any, row)

                return instance as any
            }

            // 'this' is the concrete constructor (e.g. Food), so the return type is inferred correctly.
            public static async paginate<T>(this: new () => T, o?: ModelPaginateOptions<Table>): Promise<Pagination<T>> {
                const constructor = this as any

                const pagination = await paginate(table, {
                    page: o?.page,
                    limit: o?.limit,
                    query: o?.query,
                    serialize: row => constructor.serialize(row),
                })

                for await (const row of pagination.items) {
                    await emitHook(constructor, 'serialized', row)
                }

                return pagination as any
            }

            public static async list<T>(this: new () => T, o?: ModelListOptions<Table>): Promise<T[]> {
                const constructor = this as any 

                const items = await list(table, {
                    query: o?.query,
                    serialize: row => constructor.serialize(row),
                })

                for await (const item of items) {
                    await emitHook(constructor, 'serialized', item)
                }

                return items as any
            }

            public static async find<T>(this: new () => T, o?: ModelListOptions<Table>): Promise<T | undefined> {
                const constructor = this as any

                const row = await find(table, {
                    query: o?.query,
                    serialize: row => constructor.serialize(row),
                })

                if (row) {
                    await emitHook(constructor, 'serialized', row)
                }

                return row as any
            }

            public static async findOrFail<T>(this: new () => T, o?: ModelListOptions<Table>): Promise<T> {
                const constructor = this as any

                const row = await findOrFail(table, {
                    query: o?.query,
                    serialize: row => constructor.serialize(row),
                })

                await emitHook(constructor, 'serialized', row)

                return row as any
            }

            public static async findById<T>(this: new () => T, id: any): Promise<T | undefined> {
                return this.find({
                    query: qb => (qb as any).where(primaryKey, '=', id).selectAll()
                })
            }

            public static async findByIdOrFail<T>(this: new () => T, id: any): Promise<T> {
                return this.findOrFail({
                    query: qb => (qb as any).where(primaryKey, '=', id).selectAll()
                })
            }

            public static exists<T>(this: new () => T, o?: ModelListOptions<Table>): boolean {
                return exists(table, { query: o?.query }) as any
            }

            public static count<T>(this: new () => T, o?: ModelCountOptions<Table>): number {
                return count(table, o) as any
            }

            public static create<T>(this: new () => T, values: ModelCreateOptions<Table>['values']): T {
                const constructor = this as any

                return create(table, {
                    values: values,
                    serialize: row => constructor.serialize(row),
                }) as any
            }
            
            public static createMany<T>(this: new () => T, values: Array<ModelCreateOptions<Table>['values']>): T[] {
                const constructor = this as any

                return create(table, {
                    values: values as any[],
                    serialize: row => constructor.serialize(row),
                }) as any
            }

            public static update<T>(this: new () => T, o: ModelUpdateOptions<Table>): T[] {
                const constructor = this as any

                return update(table, {
                    query: o.query,
                    values: o.values,
                    serialize: row => constructor.serialize(row),
                }) as any
            }

            public static destroy<T>(this: new () => T, o?: ModelDestroyOptions<Table>): void {
                return destroy(table, o) as any
            }

            public static firstOrCreate<T>(this: new () => T, o: ModelFirstOrCreateOptions<Table>): T {
                const constructor = this as any

                return firstOrCreate(table, {
                    select: o.select,
                    values: o.values,
                    serialize: row => constructor.serialize(row),
                }) as any
            }

            public static updateOrCreate<T>(this: new () => T, o: ModelUpdateOrCreateOptions<Table>): T {
                const constructor = this as any
                 
                return updateOrCreate(table, {
                    select: o.select,
                    update: o.update,
                    values: o.values,
                    serialize: row => constructor.serialize(row),
                }) as any
            }

            public async save() {
                await update(table, {
                    where: qb => (qb as any).eb(primaryKey, '=', (this as any)[primaryKey]),
                    values: this as any,
                })
            }

            public async destroy() {
                await destroy(table, {
                    query: qb => (qb as any).where(primaryKey, '=', (this as any).id)
                })
            }

            public async softDelete() {
                const rows = await softDelete(table, {
                    query: qb => (qb as any).where(primaryKey, '=', (this as any).id)
                })

                const row = rows[0]

                Object.assign(this as any, row)
            }
        }
    }
}