type Constructor<T = object> = new (...args: any[]) => T

type EntryKey = string | symbol | Constructor

export default class Container {
    private entries = new Map<EntryKey, any>()

    public set(key: EntryKey, value: any): void {
        this.entries.set(key, value)
    }

    public has(key: EntryKey): boolean {
        return this.entries.has(key)
    }

    public get<T>(key: EntryKey, defaultValue?: T): T {

        if (!this.has(key) && defaultValue !== undefined) {
            return defaultValue
        }

        if (!this.has(key)) {
            throw new Error(`entry not found: ${String(key)}`)
        }

        const entry = this.entries.get(key)
        
        
        return entry
    }

    public singleton<T>(classConstructor: Constructor<T>): T {
        const key = classConstructor.name
        const existingInstance = this.entries.get(key)
        
        if (existingInstance) {
            return existingInstance
        }
        
        const newInstance = new classConstructor()
        this.entries.set(key, newInstance)
        return newInstance
    }

    public load(entries: Record<any, any>): void {
        Object.entries(entries).forEach(([key, value]) => {
            this.set(key, value)
        })
    }

    public proxy<T = unknown>(key: EntryKey): T {
        return new Proxy({}, {
            get: (_target, prop) => {
                const entry = this.get<T>(key) as any

                if (typeof entry[prop] === 'function') {
                    return (...args: any[]) => entry[prop].bind(entry)(...args)
                }

                return entry[prop]
            },
            set: (_target, prop, value) => {
                const entry = this.get<T>(key) as any

                entry[prop] = value

                return true
            }
        }) as T
    }
}
