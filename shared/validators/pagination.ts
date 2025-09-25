import validator from '#shared/services/validator.service.ts'

const number = validator.create(v => v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
))

export const schema = validator.create(v => v.object({ 
    page: v.optional(number, 1),
    limit: v.optional(number, 10),
}))

