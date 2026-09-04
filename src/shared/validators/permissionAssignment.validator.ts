import validator from '#shared/services/validator.service.ts'

export const index = validator.create(v => v.object({ 
    assign_type: v.string(),
    assign_id: v.string(),
    permission_id: v.nullish(v.number()),
}))

export const create = validator.create(v => v.object({
    assign_type: v.string(),
    assign_id: v.string(),
    permission_id: v.number(),
}))

