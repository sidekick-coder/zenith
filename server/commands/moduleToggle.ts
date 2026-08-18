import modules from '#server/facades/modules.facade.ts'
import build from '#server/facades/server.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('module:toggle')
    .need('modules')
    .helpGroup('module')
    .requiredOption('-m, --module <name>', 'Module name to toggle')
    .action(async (options) => {
        const name = options.module 

        await modules.toggle(name)

        if (options.build) {
            await build.build()
        }

        logger.info(`Module ${name} toggled`)
    })
