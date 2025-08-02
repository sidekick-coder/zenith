
import * as fs from 'fs'
import * as path from 'path'
import get from 'lodash/get.js'
import set from 'lodash/set.js'
import { configPath } from '#server/utils/paths.ts'

export class ConfigService {
    private configDir: string
    private cache: Record<string, any> = {}

    constructor(configDir?: string) {
        this.configDir = configDir ?? configPath()
    }

    private parseKey(fullKey: string): { filename: string; key: string } {
        const [filename, ...rest] = fullKey.split('.')

        return {
            filename,
            key: rest.join('.') 
        }
    }

    private loadConfig(filename: string): any {
        if (!this.cache[filename]) {
            const filePath = path.join(this.configDir, `${filename}.json`)

            if (fs.existsSync(filePath)) {
                this.cache[filename] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
            } else {
                this.cache[filename] = {}
            }
        }

        return this.cache[filename]
    }

    public get(fullKey: string, defaultValue: any = null): any {
        const { filename, key } = this.parseKey(fullKey)

        const values = this.loadConfig(filename)

        if (!key) {
            return values || defaultValue
        }

        return get(values, key, defaultValue)
    }

    public set(fullKey: string, value: any): void {
        const { filename, key } = this.parseKey(fullKey)
        let values = this.loadConfig(filename)
        const filePath = path.join(this.configDir, `${filename}.json`)

        if (!key) {
            values = value
        }

        if (key && values) {
            set(values, key, value)
        }

        fs.writeFileSync(filePath, JSON.stringify(values, null, 2))

        this.cache[filename] = values
    }
}

const config = new ConfigService()

export default config
