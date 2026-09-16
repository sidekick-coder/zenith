import validator from '#shared/services/validator.service.ts'

export const schema = validator.create(v => v.object({ 
    logoFileId: v.nullish(v.union([v.string(), v.number()])),
    theme: v.optional(v.string()),
    radius: v.optional(v.picklist(['none', 'sm', 'md', 'xl', '2xl'])),
    fontFamily: v.optional(v.picklist([
        'roboto',
        'inter',
        'open-sans',
        'jetbrains-mono',
        'poppins',
        'montserrat',
        'lato',
        'nunito',
        'source-sans-3',
        'merriweather',
        'playfair-display',
        'dm-sans',
        'manrope',
        'fira-code',
    ])),
}))

export const update = validator.create(v => v.partial(schema))