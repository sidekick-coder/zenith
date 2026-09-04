import { container, HasherService, } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

export default class extends LifecycleHook {
    public hook_aliases = ['hasher']

    public async register(): Promise<void> {
        const hasher = new HasherService()

        container.set(HasherService, hasher)
    }
}
