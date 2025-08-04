import path from 'path'
import db from '#server/facades/db.facade.ts'
import router from '#server/facades/router.facade.ts'
import rootLogger from '#server/facades/logger.facade.ts'
import { serverPath } from '#server/utils/paths.ts'
import { importGlob } from '#server/utils/importAll.ts'
import type { ServerSetup } from '#server/utils/defineServerSetup.ts'
import { tryCatch } from '#shared/tryCatch.ts'

const logger = rootLogger.child({ label: 'boot.service' })

export class BootService {
    public async routes(){
        await router.loadDirectory(serverPath('routes'))
    }

    public async setup() {
        const files = await importGlob(serverPath('.runtime', '**/*.setup.ts'), {
            onBeforeImport(ctx) {
                ctx.filename += `?t=${Date.now()}` // prevent caching
            },
        })

        for await (const entry of Object.entries(files)) {
            const filename = entry[0]
            const mod = entry[1]?.default || entry[1] as ServerSetup
            const name = entry[1]?.name || entry[1]?.name || path.basename(filename, '.setup.ts')

            logger.debug('loading setup', {
                name,
                filename 
            })

            const [error] = await tryCatch(() => mod.setup({ router }))

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
        await db.load()

        router.clear()

        await this.routes()

        await this.setup()
    }
}

const bootService = new BootService()

export default bootService
