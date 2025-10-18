import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    name: v.optional(v.string()),
    shortName: v.optional(v.string()),
    description: v.optional(v.string()),
    startUrl: v.optional(v.string()),
    display: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    icons: v.optional(v.array(v.object({
        fileId: v.optional(v.string()),
        sizes: v.optional(v.string()),
        type: v.optional(v.string())
    }))),
    screenshots: v.optional(v.array(v.object({
        fileId: v.optional(v.string()),
        formFactor: v.optional(v.string()),
        sizes: v.optional(v.string())
    })))
}))

export const update = validator.create(v => v.partial(schema))