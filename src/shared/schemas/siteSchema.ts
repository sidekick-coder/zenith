import validator from '#shared/services/validator.service.ts'

function siteSchema() {
    return validator.create(v => v.object({
        name: v.nullish(v.string()),
        support_email: v.nullish(v.string()),
        favicon_image_id: v.nullish(v.number()),
        home_path: v.nullish(v.string()),
        home_redirect_path: v.nullish(v.string()),
    }))
}

export default siteSchema
