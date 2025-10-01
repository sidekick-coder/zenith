import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(6)),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))

