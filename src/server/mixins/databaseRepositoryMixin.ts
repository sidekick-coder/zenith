import type { Insertable, Selectable, WhereInterface } from 'kysely'
import type { Constructor } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import type { Database } from '#server/contracts/database.contract.ts'
import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import Pagination from '#shared/entities/pagination.entity.ts'

export interface FindManyOptions {
    limit?: number
    offset?: number
    orderBy?: string | string[]
    orderDirection?: 'asc' | 'desc' | ('asc' | 'desc')[]
}

export interface PaginateOptions {
    page?: number
    limit?: number
    orderBy?: FindManyOptions['orderBy']
    orderDirection?: FindManyOptions['orderDirection']
}

export interface DeleteManyOptions {
    limit?: number
}

export type DatabaseRepositoryQuery<T extends keyof Database> = WhereInterface<Database, T>

export function DatabaseRepository<
    TTable extends keyof Database, 
    TPrimaryKey extends keyof Database[TTable]
>(table: TTable, primaryKey: TPrimaryKey) {

    // @ts-expect-error - This is a mixin, so it doesn't have the properties at this point
    type PrimaryKeyType = Selectable<Database[TTable]>[TPrimaryKey]

    return function <TBase extends Constructor>(Base: TBase) {
        return class  DatabaseRepositoryMixin extends Base {
            protected table = table
            protected primaryKey = primaryKey

            public query(options?: { qb?: DatabaseRepositoryQuery<TTable> } & Record<string, any>) {
                return (options?.qb || db.selectFrom(this.table)) as DatabaseRepositoryQuery<TTable>
            }

            async count(options?: Record<string, any>) {
                let qb = this.query(options as any) as any

                qb = qb.select((eb: any) => eb.fn.countAll().as('count'))

                const result = await qb.executeTakeFirstOrThrow()

                return Number(result.count)
            }

            async findMany(options?: FindManyOptions & Record<string, any>) {
                let qb = this.query(options) as any

                qb = qb.selectAll()

                if (options?.limit) {
                    qb = qb.limit(options.limit)
                }

                if (options?.offset) {
                    qb = qb.offset(options.offset)
                }

                if (options?.orderBy) {
                    const orderBy = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy]
                    const orderDirection = Array.isArray(options.orderDirection) ? options.orderDirection : [options.orderDirection ?? 'asc']

                    orderBy.forEach((ob, index) => {
                        qb = qb.orderBy(ob, orderDirection[index] || 'asc')
                    })
                }

                return await qb.execute()
            }

            async findById(id: PrimaryKeyType, options?: Record<string, any>) {
                let qb = this.query(options as any) as any

                qb = qb.selectAll()

                qb = qb.where(this.primaryKey, '=', id)

                const item = await qb.executeTakeFirst()

                return item
            }

            async findByIdOrFail(id: PrimaryKeyType, options?: Record<string, any>) {
                const item = await this.findById(id, options)

                if (!item) {
                    throw new BaseException('Item not found', 404)
                }

                return item
            }

            public async paginate(options?: PaginateOptions & Record<string, any>) {
                const page = options?.page ?? 1
                const offset = (page - 1) * (options?.limit ?? 10)
                const limit = options?.limit ?? 10

                const findAllOptions = {
                    ...options,
                    limit,
                    offset
                }

                const countOptions = { ...options }

                const [items, totalItems] = await Promise.all([
                    this.findMany(findAllOptions as FindManyOptions & Record<string, any>),
                    this.count(countOptions as Record<string, any>)
                ])

                return new Pagination<Record<string, any>>({
                    items,
                    page,
                    per_page: limit,
                    total: totalItems,
                    total_pages: Math.ceil(totalItems / limit)
                })
            }

            public async create(data: Insertable<Database[TTable]>) {
                let qb = db.insertInto(this.table) as any

                qb = qb.values(data).returningAll()

                const result = await qb.executeTakeFirst()

                return result as any
            }

            public async createMany(data: Insertable<Database[TTable]>[]) {
                let qb = db.insertInto(this.table) as any

                qb = qb.values(data).returningAll()

                const result = await qb.execute()

                return result as any[]
            }

            public async updateById(id: PrimaryKeyType, data: Partial<Insertable<Database[TTable]>>) {
                const row = await this.findByIdOrFail(id)

                let qb = db.updateTable(this.table) as any

                qb = qb.set(data)
                    .where(this.primaryKey, '=', row[this.primaryKey])
                    .returningAll()

                await qb.executeTakeFirst()
            }

            public async deleteById(id: PrimaryKeyType) {
                const row = await this.findByIdOrFail(id)

                let qb = db.deleteFrom(this.table) as any

                qb = qb.where(this.primaryKey, '=', row[this.primaryKey])

                await qb.executeTakeFirst()
            }

            async deleteMany(options?: DeleteManyOptions & Record<string, any>) {
                const deleteOptions = {
                    ...options,
                    qb: db.deleteFrom(this.table) as any
                }

                let qb = this.query(deleteOptions as any) as any

                if (options?.limit) {
                    qb = qb.limit(options.limit)
                }

                await qb.execute()
            }
        }
    }
}
