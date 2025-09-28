import type { Constructor } from '#shared/utils/compose.ts'

export function BaseEntity<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        public static from<T>(this: new () => T, data: Partial<T>): T {
            const contructor = typeof this === 'function' ? this : Base
            
            const instance = new contructor() as any
            Object.assign(instance as any, data)
            return instance
        }

        public merge(data: Partial<this>): this {
            Object.assign(this, data)
            return this
        }
    }
}