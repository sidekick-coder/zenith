
import fs from 'fs'
import path from 'path'
import set from 'lodash/set.js'
import { configPath } from '#server/utils/paths.ts'
import { importGlob } from '#server/utils/importAll.ts'
import { flatten, unflatten } from '#server/utils/flatten.ts'

export default class ConfigService {
    private configDir: string
    private entries: Map<string, any> = new Map()
    private cache: Record<string, any> = {}

    constructor(configDir?: string) {
        this.configDir = configDir ?? configPath()
    }

    public list(){
        return Array.from(this.entries.entries()).map(([key,value]) => ({
            key,
            value
        }))
    }

    public async load() {
        const files = await importGlob(configPath('*.json'))

        const configs: Record<string, any> = {}

        for (const [filename, config] of Object.entries(files)) {
            configs[path.basename(filename, '.json')] = config
        }

        for (const [key, value] of Object.entries(flatten(configs))) {
            this.entries.set(key, value)
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
        const value = this.entries.get(fullKey)
        
        // Check if there are nested keys (keys that start with fullKey + '.')
        const hasNestedKeys = Array.from(this.entries.keys()).some(key => 
            key.startsWith(fullKey + '.')
        )
        
        if (hasNestedKeys) {
            // Collect all entries that start with this key
            const nestedEntries: Record<string, any> = {}
            for (const [key, val] of this.entries.entries()) {
                if (key.startsWith(fullKey + '.') || key === fullKey) {
                    nestedEntries[key.replace(fullKey + '.', '')] = val
                }
            }
            
            return unflatten(nestedEntries) || defaultValue
        }
        
        if (value === undefined) {
            return defaultValue
        }

        return value
    }

    public set(fullKey: string, value: any, save?: boolean): void {
        this.entries.set(fullKey, value)

        if (!save) return

        const { filename, key } = this.parseKey(fullKey)
        
        let values = this.get(filename)

        if (!key) {
            values = value
        }

        if (key && values) {
            set(values, key, value)
        }
        
        const filePath = path.join(this.configDir, `${filename}.json`)

        fs.writeFileSync(filePath, JSON.stringify(values, null, 2))
    }
}
