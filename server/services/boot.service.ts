import path from 'path'
import db from '#server/facades/db.facade.ts'
import router from '#server/facades/router.facade.ts'
import scheduler from '#server/facades/scheduler.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import rootLogger from '#server/facades/logger.facade.ts'
import { serverPath, storagePath } from '#server/utils/paths.ts'
import { importGlob } from '#server/utils/importAll.ts'
import type { ServerSetup } from '#server/utils/defineServerSetup.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import drive from '#server/facades/drive.facade.ts'

const logger = rootLogger.child({ label: 'boot.service' })

export class BootService {
    public async root(){
        await router.loadDirectory(serverPath('routes'))
        await scheduler.loadDirectory(serverPath('routines'))
    }

    public async setup() {
        const files = await importGlob(storagePath('runtime', 'server', '*.setup.ts'), {
            onBeforeImport(ctx) {
                ctx.filename += `?t=${Date.now()}` // prevent caching
            },
        })

        for await (const entry of Object.entries(files)) {
            const filename = entry[0]
            const mod = (entry[1]?.default || entry[1]) as ServerSetup
            const name = entry[1]?.name || path.basename(filename, '.setup.ts')

            logger.debug('loading setup', {
                name,
                filename 
            })

            const [error] = await tryCatch(() => mod.setup({
                router,
                scheduler,
                emmitter
            }))

            if (error) {
                logger.error('Error in setup', error)
                continue
            }

            logger.debug('setup loaded', {
                name,
                filename 
            })
        }
    }

    public async boot() {
        

        if (router.list().length > 0) {
            router.clear()
        }

        if (scheduler.list().length > 0) {
            await scheduler.clear()
        }

        if (emmitter.hasHandlers()) {
            emmitter.clear()
        }

        drive.load()

        await db.load()

        await this.root()
        await this.setup()

        scheduler.startAll()
    }
}

const bootService = new BootService()

export default bootService
