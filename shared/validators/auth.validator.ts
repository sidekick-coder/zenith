import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    title: v.optional(v.string()),
    image_id: v.nullish(v.number()),
    quote: v.optional(v.string()),
    quote_author: v.optional(v.string()),
    enable_registration: v.optional(v.boolean()),
    enable_email_verification: v.optional(v.boolean()),
}))

export const update = validator.create(v => v.partial(schema))