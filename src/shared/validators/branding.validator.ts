import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    logoFileId: v.nullish(v.union([v.string(), v.number()])),
    theme: v.optional(v.object({
        light: v.optional(v.record(v.string(), v.optional(v.string()))),
        dark: v.optional(v.record(v.string(), v.optional(v.string()))),
    })),
}))

export const update = validator.create(v => v.partial(schema))