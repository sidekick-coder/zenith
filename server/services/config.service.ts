
import fs from 'fs'
import path from 'path'
import { set } from 'lodash-es'
import chokidar from 'chokidar'
import Base from '#shared/services/config.service.ts'
import { configPath } from '#server/utils/paths.ts'
import { importGlob } from '#server/utils/importAll.ts'
import env from '#server/env.ts'
import logger from '#server/facades/logger.facade.ts'

interface LoadOptions {
    debug?: boolean
}

export default class ConfigService extends Base {
    private configDir: string
    public debug = false
    private logger = logger.child({ label: 'config' })

    constructor(configDir?: string) {
        super()
        this.configDir = configDir ?? configPath()
    }

    public async load(options: LoadOptions = {}) {
        this.debug = options.debug ?? false

        if (this.debug) {
            this.logger.info('service loaded in debug mode')
        }

        const files = await importGlob(configPath('*.json'))

        for (const [filename, config] of Object.entries(files)) {
            const key = path.basename(filename, '.json')

            super.set(key, config)
        }

        for (const [key, value] of Object.entries(env.CONFIG || {})) {
            super.set(key, value, 'env')
        }
    }

    public loadSync(options: LoadOptions = {}) {
        this.debug = options.debug ?? false

        if (this.debug) {
            this.logger.info('service loaded in debug mode')
        }

        const fileNames = fs.readdirSync(this.configDir).filter(file => file.endsWith('.json'))

        for (const filename of fileNames) {
            const filePath = path.join(this.configDir, filename)
            const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            const key = path.basename(filename, '.json')

            super.set(key, config)
        }

        for (const [key, value] of Object.entries(env.CONFIG || {})) {
            super.set(key, value, 'env')
        }
    }

    private parseKey(fullKey: string): { filename: string; key: string } {
        const [filename, ...rest] = fullKey.split('.')

        return {
            filename,
            key: rest.join('.') 
        }
    }

    public set(fullKey: string, value: any, source = 'runtime'): void {
        super.set(fullKey, value, source)

        const { filename, key } = this.parseKey(fullKey)
        
        let values = this.get(filename)

        if (!key) {
            values = value
        }

        if (key && values) {
            set(values, key, value)
        }
        
        const filePath = path.join(this.configDir, `${filename}.json`)

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
        }

        fs.writeFileSync(filePath, JSON.stringify(values, null, 4))
    }

    public unset(fullKey: string): void {
        const { filename, key } = this.parseKey(fullKey)
        
        const values = this.get(filename)

        set(values, key, undefined)

        const filePath = path.join(this.configDir, `${filename}.json`)

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
        }

        fs.writeFileSync(filePath, JSON.stringify(values, null, 4))

        super.unset(fullKey)

    }
}
