import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    logoType: v.union([v.literal('url'), v.literal('svg'), v.literal('file')]),
    logoUrl: v.optional(v.string()),
    logoSvg: v.optional(v.string()),
    logoFileId: v.optional(v.string()),
    cssVars: v.optional(v.record(v.string(), v.optional(v.string()))),
}))

export const update = validator.create(v => v.partial(schema))