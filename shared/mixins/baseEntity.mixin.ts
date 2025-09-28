import type { Constructor } from '#shared/utils/compose.ts'

export function BaseEntity<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
        // 'this' is the concrete constructor (e.g. Food), so the return type is inferred correctly.
        public static from<T>(this: new () => T, data: Partial<T>): T {
            const instance = new Base() as any
            Object.assign(instance as any, data)
            return instance
        }

        public merge(data: Partial<this>): this {
            Object.assign(this, data)
            return this
        }
    }
}