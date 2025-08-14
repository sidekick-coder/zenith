import * as v from 'valibot'

const base = v.object({
    NODE_ENV: v.optional(v.union([v.literal('development'), v.literal('production'), v.literal('test')]), 'development'),
    LOG_LEVEL: v.optional(v.picklist(['error', 'warn', 'info', 'debug']), 'info'),
    LOG_LABEL_FILTER: v.optional(v.pipe(v.string(), v.transform((value) => value.split(',').map(l => l.trim())))),
    CONFIG: v.optional(v.pipe(v.string(), v.transform((value) => {
        const entries = value.split(';').map(l => l.trim().split('='))

        return Object.fromEntries(entries)
    }))),
})

const schema = v.pipe(base, v.transform((value) => {
    return {
        ...value,
        isProduction: value.NODE_ENV === 'production',
        isDevelopment: value.NODE_ENV === 'development',
        isTest: value.NODE_ENV === 'test',
    }
}))

const env = v.parse(schema, process.env)

export default env
