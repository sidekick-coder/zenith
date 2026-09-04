import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    name: v.string(),
    description: v.nullish(v.string(), ''),
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))

