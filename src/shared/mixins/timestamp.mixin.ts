import type { Constructor } from '@sidekick-coder/zenith-kit/shared/utils/compose'

export function Timestamp<T extends Constructor>(base: T) {
    return class extends base {
        public created_at: Date | string
        public updated_at: Date | string
    }
}
