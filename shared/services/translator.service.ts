export default class TranslatorService {
    public entries: Map<string, string>
    public locale: string

    constructor(data: Partial<TranslatorService> = {}) {
        this.entries = data.entries || new Map<string, string>()
        this.locale = data.locale || 'en'
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
}