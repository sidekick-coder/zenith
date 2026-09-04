import ConfigService from '@sidekick-coder/zenith-kit/shared/services/ConfigService'
import ShellService from '@sidekick-coder/zenith-kit/server/services/ShellService'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'
import container from '@sidekick-coder/zenith-kit/server/facades/container'
import logger from '@sidekick-coder/zenith-kit/server/facades/logger'

export default class extends LifecycleHook {
    public hook_aliases = ['shell'] 

    public async register(): Promise<void> {
        const config = container.get<ConfigService>(ConfigService)

        const shell = new ShellService({
            debug: config.getOne<boolean>(['shell.debug', 'app.debug'], false),
            logger: logger.child({ label: 'shell' }),
        })

        container.set(ShellService, shell)
    }
}
