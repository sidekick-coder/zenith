type Constructor<T = object> = new (...args: any[]) => T

type EntryKey = string | symbol | Constructor

export default class DIService {
    private entries = new Map<EntryKey, any>()

    public set(key: EntryKey, value: any): void {
        this.entries.set(key, value)
    }

    public get<T>(key: EntryKey): T {
        const service = this.entries.get(key)
        
        if (!service) {
            throw new Error(`Service not found: ${String(key)}`)
        }
        
        return service
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
}
