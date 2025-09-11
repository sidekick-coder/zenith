import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import build from '#server/services/build.service.ts'
import env from '#server/env.ts'
import logger from '#server/facades/logger.facade.ts'

program.command('module:toggle')
    .helpGroup('module')
    .argument('<module>', 'Module to toggle')
    .action(async (name) => {
        await modules.toggle(name, { build: env.isProduction })

        await build.build()

        logger.info(`Module ${name} toggled`)
    })
