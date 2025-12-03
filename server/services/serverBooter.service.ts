import type { FSWatcher } from 'chokidar'
import modules from './modules.service.ts'
import db from '#server/facades/db.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import router from '#server/facades/router.facade.ts'
import scheduler from '#server/facades/scheduler.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import { serverPath } from '#server/utils/paths.ts'
import type { SetupServerParams } from '#server/utils/defineServerSetup.ts'
import drive from '#server/facades/drive.facade.ts'
import queue from '#server/facades/queue.facade.ts'
import setup from '#server/setup.ts'
import config from '#server/facades/config.facade.ts'

export default class ServerBooterService {
    public logger = logger.child({ label: 'boot' })
    public watcher: FSWatcher | null = null

    public async root(){
        await router.loadDirectory(serverPath('routes'))
        await scheduler.loadDirectory(serverPath('routines'))
    }

    public async setup() {

        const ctx: SetupServerParams = {
            router,
            scheduler,
            emmitter,
            assets,
            queue
        }

        await setup.setup(ctx)
        await modules.load()

        this.logger.debug('core setup loaded')
    }

    public async boot() {
        // stop & clear
        router.clear()
        emmitter.clear()
        queue.stop()

        await scheduler.clear()
        
        // start 
        await drive.load()
        await db.load()

        emmitter.load({
            debug: config.get('emmitter.debug', false)
        })
        
        // boot
        await this.root()
        await this.setup()
        
        // start processing
        await queue.loadAndStart()
        scheduler.startAll()
        queue.start()
    }
}
