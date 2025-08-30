import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({
    path: v.string(),
    params: v.optional(v.record(v.string(), v.string()), {}),
}))

const settingSiteValidator = {
    schema,
    create: schema,
}

export default settingSiteValidator
