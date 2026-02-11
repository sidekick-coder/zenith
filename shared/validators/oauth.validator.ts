import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    google_enabled: v.optional(v.boolean()),
    google_client_id: v.optional(v.string()),
    google_client_secret: v.optional(v.string()),
}))

export const update = validator.create(v => v.partial(schema))
