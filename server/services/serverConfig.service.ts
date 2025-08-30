
import fs from 'fs'
import path from 'path'
import set from 'lodash/set.js'
import chokidar from 'chokidar'
import ConfigService from '#shared/services/config.service.ts'
import { configPath } from '#server/utils/paths.ts'
import { importGlob } from '#server/utils/importAll.ts'
import { flatten } from '#shared/utils/flatten.ts'
import env from '#server/env.ts'

export default class ServiceConfigService extends ConfigService {
    private configDir: string

    constructor(configDir?: string) {
        super()
        this.configDir = configDir ?? configPath()
    }

    public async load() {
        const files = await importGlob(configPath('*.json'))

        const configs: Record<string, any> = {}

        for (const [filename, config] of Object.entries(files)) {
            configs[path.basename(filename, '.json')] = config
        }

        for (const [key, value] of Object.entries(flatten(configs))) {
            this.entries.set(key, {
                key,
                value,
                source: 'file'
            })
        }

        for (const [key, value] of Object.entries(env.CONFIG || {})) {
            this.entries.set(key, {
                key,
                value,
                source: 'env'
            })
        }
    }

    private parseKey(fullKey: string): { filename: string; key: string } {
        const [filename, ...rest] = fullKey.split('.')

        return {
            filename,
            key: rest.join('.') 
        }
    }

    public get(fullKey: string, defaultValue: any = null): any {
        // Check if there are nested keys (keys that start with fullKey + '.')
        const hasNestedKeys = Array.from(this.entries.keys()).some(key => 
            key.startsWith(fullKey + '.')
        )
        
        if (hasNestedKeys) {
            // Collect all entries that start with this key
            const result: Record<string, any> = {}

            for (const entry of this.entries.values()) {
                const { key, value } = entry

                if (key.startsWith(fullKey + '.') || key === fullKey) {
                    set(result, key.replace(fullKey + '.', ''), value)
                }
            }

            return result || defaultValue
        }

        const entry = this.entries.get(fullKey)
        
        if (!entry) {
            return defaultValue
        }

        return entry.value
    }

    public set(fullKey: string, value: any): void {
        this.entries.set(fullKey, {
            key: fullKey,
            source: 'runtime',
            value
        })

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

        fs.writeFileSync(filePath, JSON.stringify(values, null, 2))
    }

    public watch() {
        const watcher = chokidar.watch(this.configDir, {
            persistent: true,
            ignoreInitial: true
        })
        
        const reloadConfig = () => {
            this.load()
        }
        
        watcher.on('change', reloadConfig)
        watcher.on('add', reloadConfig)
        watcher.on('unlink', reloadConfig)
        
        return watcher
    }

    public async loadAndWatch(){
        await this.load()
        this.watch()
    }
}
