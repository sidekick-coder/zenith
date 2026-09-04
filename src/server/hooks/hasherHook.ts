import container from '@sidekick-coder/zenith-kit/server/facades/container'
import HasherService from '@sidekick-coder/zenith-kit/server/services/HasherService'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'

export default class extends LifecycleHook {
    public hook_aliases = ['hasher']

    public async register(): Promise<void> {
        const hasher = new HasherService()

        container.set(HasherService, hasher)
    }
}
