import validator from '#shared/services/validator.service.ts'
import type { ValidatorResult } from '@sidekick-coder/zenith-kit/shared'

export type DashboardSchema = ValidatorResult<ReturnType<typeof dashboardSchema>>

export function dashboardSchema() {
    return validator.create(v => v.object({
        id: v.number(),
        name: v.string(),
        description: v.nullable(v.string()),
        created_at: v.string(),
        updated_at: v.string(),
        deleted_at: v.nullable(v.string()),
    }))
}

dashboardSchema.create = validator.create(v => v.pick(dashboardSchema(), ['name', 'description']))

dashboardSchema.update = validator.create(v => v.partial(dashboardSchema.create))
