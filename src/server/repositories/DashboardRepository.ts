import { DatabaseRepository, MetadataQueryService   } from '@sidekick-coder/zenith-kit/server'
import type { MetadataQueryPayload } from '@sidekick-coder/zenith-kit/server'
import { validator, flatten  } from '@sidekick-coder/zenith-kit/shared'
import type { DashboardSchema } from '@sidekick-coder/zenith-kit/shared'
import dashboardMetaRepository from '#server/facades/dashboardMetaRepository.ts'

export interface DashboardRepositoryQueryOptions {
    id?: number | number[]
    search?: string
    show_deleted?: boolean
    metas?: MetadataQueryPayload
}

export default class DashboardRepository extends DatabaseRepository<DashboardSchema, number, DashboardRepositoryQueryOptions> {
    public autoCreatedAt: boolean = true
    public autoUpdatedAt: boolean = true

    constructor(db: DatabaseRepository['db']) {
        super(db, 'dashboards', 'id')
    }

    public query(payload: DashboardRepositoryQueryOptions = {}) {
        let query = super.query(payload)

        const options = validator.validate(payload, v => v.object({
            id: v.optional(v.extras.array(v.number())),
            search: v.optional(v.string()),
            show_deleted: v.optional(v.boolean()),
            metas: v.optional(v.record(v.string(), v.any()))
        }))


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
        if (options?.metas) {
            const metasQueryService = new MetadataQueryService(options.metas, 'dashboard_metas', 'dashboard_id')

            query = metasQueryService.apply(query)
        }


        return query
    }

    public softDeleteById(id: number) {
        return this.updateById(id, { deleted_at: new Date().toISOString() })
    }

    public async setMetas(dashboardId: number, payload: Record<string, any>) {

        const record = flatten(payload)

        Object.keys(record).forEach(key => {
            if (typeof record[key] === 'number') {
                record[key] = `number:${record[key]}`
            }
        })

        const metas = Object.entries(record).map(([name, value]) => ({
            dashboard_id: dashboardId,
            name,
            value,
        }))

        if (metas.length > 0) {
            await dashboardMetaRepository.createMany(metas)
        }

        return payload
    }

    
}
