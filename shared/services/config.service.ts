import { get, set, unset } from 'lodash-es'

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

    public has(key: string): boolean {
        if (!key.includes('.')) {
            return this.entries.has(key)
        }

        const primary = key.split('.')[0]
        const primaryEntry = this.entries.get(primary)

        if (!primaryEntry) {
            return false
        }

        const value = primaryEntry.value

        if (typeof value !== 'object' || Array.isArray(value)) {
            return false
        }

        const result = get(value, key.substring(primary.length + 1))

        return result !== undefined
    }

    public get<T = any | undefined>(key: string, defaultValue?: any): T {

        if (!key.includes('.')) {
            const entry = this.entries.get(key)
            
            if (!entry) {
                return defaultValue
            }

            return entry.value
        }

        const primary = key.split('.')[0]
        const primaryEntry = this.entries.get(primary)

        if (!primaryEntry) {
            return defaultValue
        }

        const value = primaryEntry.value

        if (typeof value !== 'object' || Array.isArray(value)) {
            return defaultValue
        }

        const result = get(value, key.substring(primary.length + 1), defaultValue)

        return result
    }

    public set(key: string, value: any, source = 'runtime'): void {
        if (!key.includes('.')) {
            this.entries.set(key, {
                key: key,
                source: source,
                value
            })
            return
        }

        const primary = key.split('.')[0]
        let primaryValue = this.get(primary, {})

        if (typeof primaryValue !== 'object' || Array.isArray(primaryValue)) {
            primaryValue = {}
        }

        set(primaryValue, key.substring(primary.length + 1), value)

        this.entries.set(primary, {
            key: primary,
            source: source,
            value: primaryValue
        })
    }

    public unset(key: string): void {
        if (!key.includes('.')) {
            this.entries.delete(key)
            return
        }

        const primary = key.split('.')[0]
        const primaryValue = this.get(primary, {})

        if (!primaryValue) return

        if (typeof primaryValue !== 'object' || Array.isArray(primaryValue)) {
            return
        }

        unset(primaryValue, key.substring(primary.length + 1))

        this.entries.set(primary, {
            key: primary,
            source: 'runtime',
            value: primaryValue
        })
    }
}
