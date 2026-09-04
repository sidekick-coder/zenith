import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    name: v.pipe(v.string(), v.minLength(3)),
    key: v.pipe(v.string(), v.minLength(1)),
    subject: v.pipe(v.string(), v.minLength(1)),
    body: v.nullish(v.string()),
    engine: v.nullish(v.picklist(['raw', 'html', 'mjml'])),
}))

export const create = schema

export const update = validator.create(v => v.partial(schema))
