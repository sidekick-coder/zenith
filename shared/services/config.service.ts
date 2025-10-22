import set from 'lodash/set.js'

interface Entry {
    key: string
    value: any 
    source: string
}

export default class ConfigService {
    public entries: Map<string, Entry> = new Map()

    public list(){
        return Array.from(this.entries.values())
    }

    public has(fullKey: string): boolean {
        return this.entries.has(fullKey)
    }

    public get<T = any | undefined>(fullKey: string, defaultValue?: any): T {
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

            return (result || defaultValue) as T
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
    }

    public unset(fullKey: string): void {
        this.entries.delete(fullKey)
    }
}
