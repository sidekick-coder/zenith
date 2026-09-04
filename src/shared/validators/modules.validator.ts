import validator from '#shared/services/validator.service.ts'

export const uninstall = validator.create(v => v.object({ 
    rollback: v.optional(v.boolean())
}))