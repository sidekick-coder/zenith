import { basePath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import container from '@sidekick-coder/zenith-kit/server/facades/container'
import SeederService from '@sidekick-coder/zenith-kit/server/services/SeederService'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import db from '#server/facades/db.facade.ts'

export default class extends LifecycleHook {
    public order = 3
    public hook_aliases = ['seeder']

    public async register(){
        const seeder = new SeederService({
            logger: logger.child({ label: 'seeder' }),
            emmitter: emmitter,
            debug: config.getOne(['seeder.debug', 'app.debug', 'debug'], false),
            db: db as any,
        })

        seeder.addSource({
            id: 'root',
            directory: basePath('server/seeders'),
        })

        container.set(SeederService, seeder)

        await emmitter.emitAndWait('seeder:registered', { seeder })
    }
}
