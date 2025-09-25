import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({ 
    name: v.string(),
    description: v.nullish(v.string()),
    action: v.string(),
    subject: v.string(),
    conditions: v.nullish(v.record(v.string(), v.any())),
}))

const update = validator.create(v => v.partial(schema))

const permissionValidator = {
    schema,
    create: schema,
    update,
}

export default permissionValidator
