
import fs from 'fs'
import path from 'path'
import { set } from 'lodash-es'
import chokidar from 'chokidar'
import Base from '#shared/services/config.service.ts'
import { configPath } from '#server/utils/paths.ts'
import { importGlob } from '#server/utils/importAll.ts'
import { flatten } from '#shared/utils/flatten.ts'
import env from '#server/env.ts'

export default class ConfigService extends Base {
    private configDir: string

    constructor(configDir?: string) {
        super()
        this.configDir = configDir ?? configPath()
    }

    public async load() {
        const files = await importGlob(configPath('*.json'))

        for (const [filename, config] of Object.entries(files)) {
            const key = path.basename(filename, '.json')

            this.set(key, config)
        }

        for (const [key, value] of Object.entries(env.CONFIG || {})) {
            this.set(key, value, 'env')
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

        fs.writeFileSync(filePath, JSON.stringify(values, null, 2))
    }

    public unset(fullKey: string): void {
        super.unset(fullKey)

        const { filename, key } = this.parseKey(fullKey)
        
        const values = this.get(filename)

        set(values, key, undefined)

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
