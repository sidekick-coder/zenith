import { container, ShellService } from '@sidekick-coder/zenith-kit/server'
import { ConfigService, LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import logger from '#server/facades/logger.facade.ts'

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
