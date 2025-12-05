import type { Constructor } from '#shared/utils/compose.ts'

export function Lifecycle<T extends Constructor>(base: T) {
    return class extends base {
        public id = 'lifecycle-hook'

        public async onRegister(): Promise<void> {
        // Logic to execute when the service is loaded
        }

        public async onLoad(): Promise<void> {
        // Logic to execute when the service is registered
        }

        public async onBoot(): Promise<void> {
        // Logic to execute when the service is booting
        }

        public async onShutdown(): Promise<void> {
        // Logic to execute when the service is shutting down
        }
    }
}