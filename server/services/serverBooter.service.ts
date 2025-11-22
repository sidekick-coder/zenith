import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import modules from './modules.service.ts'
import db from '#server/facades/db.facade.ts'
import assets from '#server/facades/assets.facade.ts'
import router from '#server/facades/router.facade.ts'
import scheduler from '#server/facades/scheduler.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import { serverPath, configPath } from '#server/utils/paths.ts'
import type { ServerSetup, SetupServerParams } from '#server/utils/defineServerSetup.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import drive from '#server/facades/drive.facade.ts'
import queue from '#server/facades/queue.facade.ts'
import setup from '#server/setup.ts'

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

        this.logger.debug('core setup loaded')

        const mods = await modules.list({
            enabled: true
        })

        const files = mods.flatMap(m => m.files).filter(f => f.type === 'setup:server')

        for await (const f of files) {
            const filename = f.src
            const [errorImport, mod] = await tryCatch(() => import(f.src) as Promise<{ default: ServerSetup }>)

            if (errorImport) {
                this.logger.error('Error importing setup', errorImport)
                continue
            }

            const [error] = await tryCatch(() => mod.default.setup(ctx))

            if (error) {
                this.logger.error('Error in setup', error)
                continue
            }

            this.logger.debug('setup loaded', { filename })
        }
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
        
        // boot
        await this.root()
        await this.setup()
        
        // start processing
        await queue.loadAndStart()
        scheduler.startAll()
        queue.start()
    }

    public watch() {
        if (this.watcher) {
            return this.watcher
        }
        
        const entries = [
            configPath('modules.json')
        ]

        this.watcher = chokidar.watch(entries, {
            persistent: true,
            ignoreInitial: true
        })

        this.watcher.on('change', async (filename) => {
            this.logger.info('file changed, rebooting server...', {
                filename
            })

            await this.boot()
        })

        return this.watcher
    }

    public async bootAndWatch() {
        await this.boot()
        this.watch()
    }
}
