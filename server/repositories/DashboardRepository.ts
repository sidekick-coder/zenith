import type { DashboardSchema } from '#shared/schemas/index.ts'
import { DatabaseRepository } from '@sidekick-coder/zenith-kit/server'

export interface DashboardRepositoryQueryOptions {
    id?: number | number[]
    search?: string
    show_deleted?: boolean
}

export default class DashboardRepository extends DatabaseRepository<DashboardSchema, number, DashboardRepositoryQueryOptions> {
    public autoCreatedAt: boolean = true
    public autoUpdatedAt: boolean = true

    constructor(db: DatabaseRepository['db']) {
        super(db, 'dashboards', 'id')
    }

    public query(options: DashboardRepositoryQueryOptions = {}) {
        let query = super.query(options)

        if (!options.show_deleted) {
            query = query.where('deleted_at', 'is', null)
        }

        if (options.search) {
            query = query.where('name', 'like', `%${options.search}%`)
        }

        if (options?.id) {
            const ids = Array.isArray(options.id) ? options.id : [options.id]

            query = query.where('id', 'in', ids)
        }

        return query
    }

    public softDeleteById(id: number) {
        return this.updateById(id, { deleted_at: new Date().toISOString() })
    }
}
