import type { UserTable } from '../database/types.ts'
import db from '#server/facades/db.ts'
import hasher from '#server/facades/hasher.ts'

export type UserInsert = Omit<UserTable, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
export type UserUpdate = Partial<Omit<UserTable, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>
export type UserSelect = UserTable

export interface UserFilters {
    email?: string
    username?: string
    id?: number
}

export interface UserFindOptions {
    limit?: number
    offset?: number
    sort?: string
    filters?: UserFilters
}

export class UserRepository {
    public query(filters: UserFilters = {}) {
        let query = db.selectFrom('users')
            .selectAll()
            .where('deleted_at', 'is', null)

        // Apply filters
        if (filters?.email) {
            query = query.where('email', '=', filters.email)
        }
        
        if (filters?.username) {
            query = query.where('username', 'like', `%${filters.username}%`)
        }

        if (filters?.id) {
            query = query.where('id', '=', filters.id)
        }

        return query
    }

    async list(options: UserFindOptions = {}) {
        let query = this.query(options.filters)

        // Apply sorting
        if (options.sort) {
            const sortColumns = options.sort.split(',')
            
            sortColumns.forEach(sortColumn => {
                const trimmed = sortColumn.trim()
                
                if (trimmed.startsWith('-')) {
                    const column = trimmed.slice(1)
                    query = query.orderBy(column as keyof UserTable, 'desc')
                }
                if (trimmed.startsWith('+')) {
                    const column = trimmed.slice(1)
                    query = query.orderBy(column as keyof UserTable, 'asc')
                }
                if (!trimmed.startsWith('-') && !trimmed.startsWith('+')) {
                    query = query.orderBy(trimmed as keyof UserTable, 'asc')
                }
            })
        }

        // Apply limit and offset
        if (options.limit && options.limit > 0) {
            query = query.limit(options.limit)
        }

        if (options.offset && options.offset > 0) {
            query = query.offset(options.offset)
        }

        return query.execute()
    }

    async find(id: number) {
        const results = await this.list({ 
            limit: 1,
            filters: { id }
        })

        return results[0] ?? null
    }

    async findOrFail(id: number) {
        const item = await this.find(id)

        if (!item) {
            throw new Error(`User with ID ${id} not found`)
        }

        return item
    }

    async create(payload: UserInsert) {
        const userData = {
            ...payload,
            password: await hasher.hash(payload.password)
        }

        return db.insertInto('users')
            .values(userData)
            .returningAll()
            .executeTakeFirst()
    }

    async update(id: number, payload: UserUpdate) {
        const updateData = { ...payload }
        
        if (updateData.password) {
            updateData.password = await hasher.hash(updateData.password)
        }

        return db.updateTable('users')
            .set(updateData)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst()
    }

    async softDelete(id: number) {
        return db.updateTable('users')
            .set({ deleted_at: new Date() as any })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst()
    }

    async hardDelete(id: number) {
        return db.deleteFrom('users')
            .where('id', '=', id)
            .executeTakeFirst()
    }

    async exists(email: string) {
        const user = await db.selectFrom('users')
            .select('id')
            .where('email', '=', email)
            .where('deleted_at', 'is', null)
            .executeTakeFirst()
        
        return user !== undefined
    }

    async count(filters: UserFilters = {}) {
        const result = await this.query(filters)
            .select((eb) => eb.fn.countAll().as('count'))
            .executeTakeFirst()
        
        return result ? Number(result.count) : 0
    }
    
    async paginate(page = 1, limit = 10, options: Omit<UserFindOptions, 'limit' | 'offset'> = {}) {
        const filters = options.filters || {}
        const offset = (page - 1) * limit

        const result = await this.list({
            ...options,
            limit, 
            offset,
            filters
        })

        const total = await this.count(filters)

        return {
            data: result,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                per_page: limit
            }
        }
    }
}

const userRepository  = new UserRepository()

export default userRepository