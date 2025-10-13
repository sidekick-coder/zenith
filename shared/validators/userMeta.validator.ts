import * as v from 'valibot'

export const schema = v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
    value: v.optional(v.string()),
})

export const update = v.object({
    name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
    value: v.optional(v.string()),
})