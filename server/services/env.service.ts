import fs from 'fs'
import dotenv from 'dotenv'
import * as v from 'valibot'
import { basePath } from '#server/utils/paths.ts'

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
    APP_URL: v.optional(v.string(), 'http://localhost:3000'),
    ZARTE: v.optional(boolean, 'false'),
    NODE_ENV: v.optional(v.union([v.literal('development'), v.literal('production'), v.literal('test')]), 'development'),
    LOG_LEVEL: v.optional(v.picklist(['error', 'warn', 'info', 'debug']), 'info'),
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

type EnvType = v.InferOutput<typeof schema>

export default class EnvService {
    private env: EnvType | null = null

    public load() {
        if (fs.existsSync(basePath('.env'))) {
            dotenv.config({ 
                path: basePath('.env'),
                override: true,
                quiet: true,
            })
        }

        this.env = v.parse(schema, process.env)

        return this.env
    }

    public get<K extends keyof EnvType>(key: K): EnvType[K] {
        if (!this.env) {
            this.load()
        }

        return this.env![key]
    }

    public set<K extends keyof EnvType>(key: K, value: EnvType[K]) {
        if (!this.env) {
            this.load()
        }

        this.env![key] = value
    }
}
