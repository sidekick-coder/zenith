import validator from '#shared/services/validator.service.ts'
import MetadataQueryService from '#server/services/metadataQuery.service.ts'

export const filter = validator.create(v => v.object({
    eq: v.optional(v.string()),
    neq: v.optional(v.string()),
    
    like: v.optional(v.string()),
    nlike: v.optional(v.string()),

    in: v.optional(v.array(v.string())),
    nin: v.optional(v.array(v.string())),

    gt: v.optional(v.string()),
    gte: v.optional(v.string()),
    lt: v.optional(v.string()),
    lte: v.optional(v.string()),

    is_null: v.optional(v.boolean())
}))

export const query = validator.create(v => v.pipe(
    v.record(v.string(), v.union([v.string(), filter])),
    v.transform((data) => new MetadataQueryService(data))
))
