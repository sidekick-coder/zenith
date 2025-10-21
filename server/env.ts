import fs from 'fs'
import * as v from 'valibot'
import { basePath } from '#server/utils/paths.ts'

if (fs.existsSync(basePath('.env'))) {
    process.loadEnvFile(basePath('.env'))
}

const configSchema = v.optional(v.pipe(v.string(), v.transform((value) => {
    const entries = value.split(/[;\n]/)
        .filter(Boolean)
        .filter(l => l.includes('='))
        .map(l => l.trim().split('='))

    return Object.fromEntries(entries)
})))

const boolean = v.pipe(
    v.union([v.literal('true'), v.literal('false'), v.literal('1'), v.literal('0')]),
    v.transform((value) => value === 'true' || value === '1'),
    v.boolean()
)

const base = v.object({
    APP_URL: v.string(), // use to mount upload/stream urls
    ZARTE: v.optional(boolean, 'false'),
    NODE_ENV: v.optional(v.union([v.literal('development'), v.literal('production'), v.literal('test')]), 'development'),
    LOG_LEVEL: v.optional(v.picklist(['error', 'warn', 'info', 'debug']), 'info'),
    LOG_LABEL_FILTER: v.optional(v.pipe(v.string(), v.transform((value) => value.split(',').map(l => l.trim())))),
    CONFIG: configSchema,
    CLIENT_CONFIG: configSchema,
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
