import validator from '#shared/services/validator.service.ts'

export function authSchema() {
    return validator.create(v => v.object({
        disabled: v.optional(v.boolean()),
        enable_registration: v.optional(v.boolean()),
        enable_email_verification: v.optional(v.boolean()),
        redirect_to_on_login: v.optional(v.string()),
    }))
}

authSchema.update = validator.create(v => v.partial(authSchema()))
