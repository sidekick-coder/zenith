import type { Constructor } from '#shared/utils/compose.ts'
import config from '#server/facades/config.facade.ts'

export type ConfigModel = ReturnType<ReturnType<typeof ConfigModelMixin>>

export function ConfigModelMixin(key: string) {
    return function ConfigModelMixinExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {
            public static __isConfigModel = true

            public static serialize<T>(this: new () => T, row: any): Promise<T> {
                const instance = new this() as any

                Object.assign(instance as any, row)

                return instance as any
            }

            public static async list<T>(this: new () => T): Promise<T[]> {
                const constructor = this as any

                const map = config.get<Record<string, any>>(key) || {}

                const items = []

                for (const [id, k] of Object.entries(map)) {
                    const item = constructor.serialize({ 
                        ...k, 
                        id 
                    })

                    items.push(item)
                }

                return items as any
            }

            public static async find<T>(this: new () => T, id: string): Promise<T | null> {
                const constructor = this as any as ConfigModel

                const all = await constructor.list()

                const item = all.find(i => (i as any).id === id)

                return (item || null) as any
            }

            public static async findOrFail<T>(this: new () => T, id: string): Promise<T> {
                const constructor = this as any as ConfigModel

                const item = await constructor.find(id)

                if (!item) {
                    throw new Error('Entity item not found')
                }

                return item as any
            }

            public static async create<T>(this: new () => T, item: T & { id: string }): Promise<void> {
                const constructor = this as any as ConfigModel

                const map = config.get<Record<string, any>>(key) || {}

                if (map[item.id]) {
                    throw new Error('Entity item already exists')
                }

                map[item.id] = { ...item } as any

                delete map[item.id].id

                await config.set(key, map)

                return constructor.findOrFail(item.id) as any
            }

            public static async update<T>(this: new () => T, id: string, data: T): Promise<void> {
                const constructor = this as any as ConfigModel

                const map = config.get<Record<string, any>>(key) || {}

                if (!map[id]) {
                    throw new Error('Entity item not found')
                }

                map[id] = { ...data } as any

                delete map[id].id

                await config.set(key, map)

                return constructor.findOrFail(id) as any
            }

            public static async destroy<T>(this: new () => T, id: string): Promise<void> {

                const map = config.get<Record<string, any>>(key) || {}

                if (!map[id]) {
                    throw new Error('Entity item not found')
                }

                delete map[id]

                await config.set(key, map)
            }
        }
    }
}