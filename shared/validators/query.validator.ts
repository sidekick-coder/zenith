import validator from '#shared/services/validator.service.ts'

export const number = () => validator.create(v => v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
))