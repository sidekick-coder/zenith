import LoggerService from './logger.service.ts'

export default class TranslatorService {
    public entries: Map<string, string>
    public locale: string
    public debug: boolean = false
    public logger: LoggerService
    public cache: Map<string, Record<string, string>>

    constructor(data: Partial<TranslatorService> = {}) {
        this.entries = data.entries || new Map<string, string>()
        this.locale = data.locale || 'en'
        this.debug = data.debug || false
        this.cache = data.cache || new Map<string, Record<string, string>>()
        this.logger = data.logger || new LoggerService()

        if (this.debug) {
            this.logger.debug('initialized in debug mode', { locale: this.locale })
        }
    }

    public list(): { key: string; value: string }[] {
        const items: { key: string; value: string }[] = []

        this.entries.forEach((value, key) => {
            items.push({ 
                key,
                value 
            })
        })

        return items
    }

    public t(key: string, args: Record<string, string> = {}): string {
        const entry = this.entries.get(key) || key

        let translation = entry

        if (!Object.keys(args).length) {
            return translation
        }

        Object.entries(args).forEach(([aKey, aValue]) => {
            translation = translation.replace(`:${aKey}`, aValue)
        })

        return translation
    }

    public loadLocale(locale: string): Record<string, string> {
        // To be implemented in subclasses
        throw new Error('Method not implemented.')
    }

    public load(locale: string){
        const cache = this.cache.get(locale)!
        
        if (cache && this.debug) {
            this.logger.debug(`load locale "${locale}" from cache`, {
                locale,
                length: Object.keys(cache).length
            })
        }
        
        if (cache) {
            this.entries = new Map<string, string>(Object.entries(cache))
            this.locale = locale
            return
        }
        
        const entries = this.loadLocale(locale)

        this.entries = new Map<string, string>(Object.entries(entries))
        
        this.locale = locale

        if (this.debug) {
            this.logger.debug(`load locale ${locale}`, {
                locale,
                keys: Object.keys(entries).length
            })
        }
    }
}