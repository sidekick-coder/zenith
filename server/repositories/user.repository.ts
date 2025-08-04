import type { UserTable } from '#server/database/types.ts'
import db from '#server/facades/db.facade.ts'
import hasher from '#server/facades/hasher.facade.ts'

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
            .select(['id', 'email', 'username', 'name', 'created_at', 'updated_at', 'deleted_at'])
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

        if (options.limit && options.limit > 0) {
            query = query.limit(options.limit)
        }

        if (options.offset && options.offset > 0) {
            query = query.offset(options.offset)
        }

        console.log('Executing query:', query.compile())

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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
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

        const query = db.updateTable('users')
            .set(updateData)
            .where('id', '=', id)
            .returningAll()

        console.log('Executing update query:', query.compile())

        return query.executeTakeFirst()
    }

    async softDelete(id: number) {
        return db.updateTable('users')
            .where('id', '=', id)
            .set('deleted_at', new Date().toISOString())
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
