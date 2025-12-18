import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(6)),
    username: v.pipe(v.string(), v.regex(/^[a-zA-Z0-9_]+$/)),
    name: v.string(),
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))

