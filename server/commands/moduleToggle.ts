import { program } from 'commander'
import modules from '#server/facades/modules.facade.ts'
import build from '#server/facades/server.facade.ts'
import logger from '#server/facades/logger.facade.ts'

program.command('module:toggle')
    .helpGroup('module')
    .argument('<module>', 'Module to toggle')
    .option('-b, --build', 'Whether to build after toggling the module', false)
    .action(async (name, options) => {
        await modules.toggle(name)

        if (options.build) {
            await build.build()
        }

        logger.info(`Module ${name} toggled`)
    })
