import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    defaultLocale: v.optional(v.string()),
}))

export const update = validator.create(v => v.partial(schema))
