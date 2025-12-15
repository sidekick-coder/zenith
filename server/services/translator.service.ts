import fs from 'fs'
import path from 'path'
import { basePath } from '#server/utils/paths.ts'
import Base from '#shared/services/translator.service.ts'

export default class TranslatorService extends Base {
    public sources = new Map<string, string[]>()
    public cache = new Map<string, Record<string, string>>()

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

        console.log(Array.from(this.sources.entries()))
    }

    private loadLocale(locale: string): Record<string, string> {
        if (this.cache.has(locale)) {
            return this.cache.get(locale)!
        }

        const files = this.sources.get(locale)

        if (!files) {
            return {}
        }

        const entries: Record<string, string> = {}

        for (const file of files) {
            Object.assign(entries, JSON.parse(fs.readFileSync(file, 'utf-8')))
        }

        this.cache.set(locale, entries)

        return entries
    }


    public load(locale: string){
        const entries = this.loadLocale(locale)

        this.entries = new Map<string, string>(Object.entries(entries))
        
        this.locale = locale
    }
}