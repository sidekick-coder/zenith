import { DatabaseRepository } from '@sidekick-coder/zenith-kit/server'
import type { DashboardMetaSchema } from '#shared/schemas/index.ts'

export interface DashboardMetaRepositoryQueryOptions {
    id?: number | number[]
    dashboard_id?: number | number[]
}

export default class DashboardMetaRepository extends DatabaseRepository<DashboardMetaSchema, number, DashboardMetaRepositoryQueryOptions> {
    constructor(db: DatabaseRepository['db']) {
        super(db, 'dashboard_metas', 'id')
    }

    public query(options: DashboardMetaRepositoryQueryOptions = {}) {
        let query = super.query(options)

        if (options?.id) {
            const ids = Array.isArray(options.id) ? options.id : [options.id]

            query = query.where('id', 'in', ids)
        }

        if (options?.dashboard_id) {
            const ids = Array.isArray(options.dashboard_id) ? options.dashboard_id : [options.dashboard_id]

            query = query.where('dashboard_id', 'in', ids)
        }

        return query
    }
}
