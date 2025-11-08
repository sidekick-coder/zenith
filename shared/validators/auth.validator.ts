import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    title: v.optional(v.string()),
    image_id: v.nullish(v.number()),
    quote: v.optional(v.string()),
    quoteAuthor: v.optional(v.string()),
    enableSignUp: v.optional(v.boolean()),
}))

export const update = validator.create(v => v.partial(schema))