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

    is_null: v.optional(v.pipe(
        v.union([v.string(), v.boolean()]),
        v.transform(v => v === true || v === 'true'),
    )),
    exists: v.optional(v.pipe(
        v.union([v.string(), v.boolean()]),
        v.transform(v => v === true || v === 'true'),
    )),
}))

export const query = (table: string, foreignKey: string) => validator.create(v => v.pipe(
    v.record(v.string(), v.any()),
    v.transform((data) => {
        const result: Record<string, any> = {}

        for (const key in data) {
            const value = data[key]

            if (typeof value === 'string') {
                result[key] = { eq: value }
                continue
            }

            result[key] = value
        }

        return result
    }),
    v.record(v.string(), filter),
    v.transform((data) => new MetadataQueryService(data, table, foreignKey))
))