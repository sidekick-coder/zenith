import validator from '#shared/services/validator.service.ts'

const schema = validator.create(v => v.object({ 
    name: v.nullish(v.string()),
    support_email: v.nullish(v.string()),
    favicon_image_id: v.nullish(v.number()),
    home_route_path: v.nullish(v.string()),
}))

const settingSiteValidator = {
    schema,
    create: schema,
}

export default settingSiteValidator
