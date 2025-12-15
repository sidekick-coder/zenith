import fs from 'fs'
import path from 'path'
import { basePath } from '#server/utils/paths.ts'
import Base from '#shared/services/translator.service.ts'

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
   
}