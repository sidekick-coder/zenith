import type { Constructor } from '@sidekick-coder/zenith-kit/shared/utils/compose'

export function SoftDelete<T extends Constructor>(base: T) {
    return class extends base {
        public deleted_at: Date | string | null = null
    }
}
