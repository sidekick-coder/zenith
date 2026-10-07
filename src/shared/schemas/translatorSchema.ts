import validator from '#shared/services/validator.service.ts'

export function translatorSchema() {
    return validator.create(v => v.object({ default_locale: v.optional(v.string()), }))
}

translatorSchema.update = validator.create(v => v.partial(translatorSchema()))
