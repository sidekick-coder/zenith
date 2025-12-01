import { updateOrCreate } from '#server/queries/index.ts'
import type { Database } from '#server/contracts/database.contract.ts'
import db from '#server/facades/db.facade.ts'
import type { Constructor } from '#shared/utils/compose.ts'
import config from '#server/facades/config.facade.ts'

export type ConfigModelMixinContract = ReturnType<typeof ConfigModelMixin>

export function ConfigModelMixin(key: string) {
    return function ConfigModelMixinExtend<TBase extends Constructor>(Base: TBase) {
        return class extends Base {
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
        }
    }
}