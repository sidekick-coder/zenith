import { format } from 'date-fns'
import { get, set } from 'lodash-es'
import { object as vObject, any as vAny  } from 'valibot'
import type { AnySchema, BaseSchema, BaseSchemaAsync, ObjectEntries } from 'valibot'
import qs from 'qs'
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
    v.transform(v => v ? format(v, 'yyyy-MM-dd') : v),
))

export const datetime = () => validator.create(v => v.pipe(
    v.union([v.string(), v.date()]),
    v.transform(v => {
        if (!v) return v

        if (v === 'null') return null

        if (typeof v === 'string') {
            v = new Date(v)
        }

        return format(v, 'yyyy-MM-dd HH:mm')
    }),
))

export const array = <T extends BaseSchema<any, any, any>>(schema: T = vAny() as any as T) => validator
    .create(v => v.pipe(
        v.union([v.string(), v.array(v.string())]),
        v.transform(value => Array.isArray(value) ? value : value.split(',')),
        v.array(schema),
    ))

export const arrayNumber = () => validator
    .create(v => v.pipe(
        array(),
        v.transform(value => value.map(Number)),
    ))

export const object = () => {
    return validator
        .create(v => v.pipe(
            v.union([v.string(), v.record(v.string(), v.any())]),
            v.transform(value => typeof value === 'string' ? qs.parse(value) : value),
            v.transform(value => {
                const result: Record<string, any> = {}
                
                for (const key in value) {
                    set(result, key, get(value, key))
                }

                return result
            }),
        ))
}