import fs from 'fs'
import set from 'lodash-es/set.js'
import dotenv from 'dotenv'
import * as v from 'valibot'
import { basePath } from '#server/utils/paths.ts'

const configSchema = v.optional(v.pipe(v.string(), v.transform((value) => {
    const entries = value.split(/[;\n]/)
        .filter(Boolean)
        .filter(l => l.includes('='))
        .map(l => l.trim().split('='))

    const obj = Object.fromEntries(entries) as Record<string, string>

    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
        let parsedValue: any = value

        if (value.startsWith('bool:')) {
            parsedValue = value.replace('bool:', '').trim() === 'true'
        }

        set(result, key, parsedValue)
    }

    return result
})))

const boolean = v.pipe(
    v.union([v.literal('true'), v.literal('false'), v.literal('1'), v.literal('0')]),
    v.transform((value) => value === 'true' || value === '1'),
    v.boolean()
)

const schema = v.object({
    APP_URL: v.optional(v.string(), 'http://localhost:3000'),
    PORT: v.optional(v.pipe(v.string(), v.transform((value) => parseInt(value))), '3000'),
    HOST: v.optional(v.string(), '0.0.0.0'),
    ZARTE: v.optional(boolean, 'false'),
    NODE_ENV: v.optional(v.union([v.literal('development'), v.literal('production'), v.literal('test')]), 'development'),
    LOG_LEVEL: v.optional(v.picklist(['error', 'warn', 'info', 'debug']), 'info'),
    LIFECYCLE_DEBUG: v.optional(boolean, 'false'),
    CLIENT_CONFIG: configSchema,
    
    CONFIG: configSchema,
    CONFIG_DEBUG: v.optional(boolean, 'false'),
    CONFIG_DRIVER: v.optional(v.picklist(['fs', 's3']), 'fs'),
    CONFIG_FS_PATH: v.optional(v.string(), basePath('storage', 'config')),
    CONFIG_S3_BUCKET: v.optional(v.string()),
    CONFIG_S3_REGION: v.optional(v.string()),
    CONFIG_S3_ACCESS_KEY_ID: v.optional(v.string()),
    CONFIG_S3_SECRET_ACCESS_KEY: v.optional(v.string()),
    CONFIG_S3_SESSION_TOKEN: v.optional(v.string()),
    CONFIG_S3_ENDPOINT: v.optional(v.string()),
    CONFIG_S3_PREFIX: v.optional(v.string(), ''),
})

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

    public get production(): boolean {
        return this.get('NODE_ENV') === 'production'
    }

    public get development(): boolean {
        return this.get('NODE_ENV') === 'development'
    }

    public get test(): boolean {
        return this.get('NODE_ENV') === 'test'
    }

    public get<K extends keyof EnvType>(key: K, defaultValue?: any): EnvType[K] {
        if (!this.env) {
            this.load()
        }

        return this.env![key] !== undefined ? this.env![key] : defaultValue
    }

    public set<K extends keyof EnvType>(key: K, value: EnvType[K]) {
        if (!this.env) {
            this.load()
        }

        this.env![key] = value
    }
}
