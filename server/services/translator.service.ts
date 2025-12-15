import fs from 'fs'
import path from 'path'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { glob } from 'glob'
import { basePath } from '#server/utils/paths.ts'
import Base from '#shared/services/translator.service.ts'

interface ScanOptions {
    directory: string
    exclude?: string[]
}

export default class TranslatorService extends Base {
    public sources = new Map<string, string[]>()

    public discover(){
        const files = [] as string[]
        
        fs.readdirSync(basePath('langs')).forEach(file => {
            if(file.endsWith('.json')){
                files.push(basePath('langs', file))
            }
        })

        for (const file of files) {
            const locale = path.basename(file, '.json')
            const source = this.sources.get(locale) || []
            
            source.push(file)

            this.sources.set(locale, source)
        }

        for (const locale of this.sources.keys()) {
            this.localeLoaders.set(locale, async () => this.loadLocale(locale))
        }

        if (this.debug) {
            this.logger.debug('discovered translation files',  Object.fromEntries(this.sources))
        }

        // default is en
        this.sources.set('en-US', this.sources.get('en-US') || [])
        this.localeLoaders.set('en-US', async () => this.loadLocale('en-US'))
    }

    public loadLocale(locale: string): Record<string, string> {
        const files = this.sources.get(locale)

        if (!files) {
            return {}
        }

        const entries: Record<string, string> = {}

        for (const file of files) {
            Object.assign(entries, JSON.parse(fs.readFileSync(file, 'utf-8')))
        }

        return entries
    }

    public async scan(options: ScanOptions) {
        const { directory, exclude } = options

        const resolvedDirectory = resolve(directory)

        const ignore = [
            '**/node_modules/**',
            '**/dist/**',
            '**/storage/**',
            '**/client-dist/**',
            '**/tmp/**',
            '**/*.d.ts',
        ]

        if (exclude) {
            ignore.push(...exclude)
        }

        const files = await glob('**/*.{vue,ts,js}', {
            cwd: resolvedDirectory,
            absolute: true,
            ignore: ignore,
        })

        if (this.debug) {
            this.logger.debug(`${files.length} files founded`)
        }

        const keys = new Set<string>()
        const pattern = /\$t\(['"]([^'"]+)['"]\)/g

        for (const file of files) {
            const content = await readFile(file, 'utf-8')
            const matches = content.matchAll(pattern)

            for (const match of matches) {
                keys.add(match[1])
            }
        }

        if (this.debug) {
            this.logger.debug(`${keys.size} keys founded`)
        }

        const record: Record<string, string> = {}

        Array.from(keys)
            .sort()
            .forEach(key => {
                record[key] = ''
            })

        return record
    }
   
}