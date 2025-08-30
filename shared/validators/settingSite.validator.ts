import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({ home_route_path: v.nullish(v.string()), }))

const settingSiteValidator = {
    schema,
    create: schema,
}

export default settingSiteValidator
