import type { Constructor } from '#shared/utils/compose.ts'

export function SoftDelete<T extends Constructor>(base: T) {
    return class extends base {
        public deleted_at: Date | string | null = null
    }
}