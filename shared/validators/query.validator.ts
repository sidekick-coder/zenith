import { format } from 'date-fns'
import validator from '#shared/services/validator.service.ts'

export const number = () => validator.create(v => v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
))

export const boolean = () => validator.create(v => v.pipe(
    v.union([v.string(), v.boolean()]),
    v.transform(v => v === true || v === 'true'),
))

export const date = () => validator.create(v => v.pipe(
    v.union([v.string(), v.date()]),
    v.transform(v => v instanceof Date ? v : new Date(v)),
    v.transform(v => format(v, 'yyyy-MM-dd')),
))

export const datetime = () => validator.create(v => v.pipe(
    v.union([v.string(), v.date()]),
    v.transform(v => v instanceof Date ? v : new Date(v)),
    v.transform(v => format(v, 'yyyy-MM-dd HH:mm'))
))

export const array = () => validator
    .create(v => v.pipe(
        v.string(),
        v.transform(value => value.split(',')),
    ))