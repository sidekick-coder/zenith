import type { Insertable, Selectable } from 'kysely'
import type { Database } from '#server/contracts/database.contract.ts'
import BaseException from '#server/exceptions/base.ts'
import db from '#server/facades/db.facade.ts'
import Pagination from '#shared/entities/pagination.entity.ts'
import type { Constructor } from '#shared/utils/compose.ts'

export interface FindManyOptions {
    limit?: number
    offset?: number
}

export interface PaginateOptions {
    page?: number
    limit?: number
}

interface HasQueryOptions<T> {
    __options?: T
}

interface HasEntityType<T> {
    __entity?: T
}

type ExtractQueryOptions<T> = T extends HasQueryOptions<infer Q> ? Q : never

export type ExtractEntityType<T, F = Record<string, any>> = T extends HasEntityType<infer E> ? E : F

export function DatabaseRepository<TTable extends keyof Database, TPrimaryKey extends keyof Database[TTable]
>(table: TTable, primaryKey: TPrimaryKey) {

    type PrimaryKeyType = Selectable<Database[TTable]>[TPrimaryKey]

    return function DatabaseRepositoryMixin<TBase extends Constructor>(Base: TBase) {
        return class DatabaseRepositoryMixin extends Base {
            protected table = table
            protected primaryKey = primaryKey

            public query(_options?: ExtractQueryOptions<this>) {
                return db.selectFrom(this.table)
            }

            async count(options?: ExtractQueryOptions<this>) {
                let qb = this.query(options).selectAll() as any

                qb = qb.select((eb: any) => eb.fn.countAll().as('count'))

                const result = await qb.executeTakeFirstOrThrow()

                return Number(result.count)
            }

            async findMany(options?: FindManyOptions & ExtractQueryOptions<this>) {
                let qb = this.query(options).selectAll() as any

                if (options?.limit) {
                    qb = qb.limit(options.limit)
                }

                if (options?.offset) {
                    qb = qb.offset(options.offset)
                }

                return await qb.execute()
            }

            async findById(id: PrimaryKeyType, options?: ExtractQueryOptions<this>) {
                let qb = this.query(options).selectAll() as any

                qb = qb.where(this.primaryKey, '=', id)

                const item = await qb.executeTakeFirst()

                return item
            }

            async findByIdOrFail(id: PrimaryKeyType, options?: ExtractQueryOptions<this>) {
                const item = await this.findById(id, options)

                if (!item) {
                    throw new BaseException('Item not found', 404)
                }

                return item
            }

            public async paginate(options?: PaginateOptions & ExtractQueryOptions<this>) {
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
                    this.findMany(findAllOptions as FindManyOptions & ExtractQueryOptions<this>),
                    this.count(countOptions as ExtractQueryOptions<this>)
                ])

                return new Pagination<ExtractEntityType<this, Database[TTable]>>({
                    items,
                    page,
                    per_page: limit,
                    total: totalItems,
                    total_pages: Math.ceil(totalItems / limit)
                })
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
        }
    }
}
