import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    purpose: v.string(),
    drive: v.nullish(v.string()),
    folder: v.nullish(v.string()),
    client_name: v.string(),
    public: v.nullish(v.boolean()),
    mime_types: v.string(),
    max_size: v.number()
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))