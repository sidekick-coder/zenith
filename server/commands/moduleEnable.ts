import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import env from '#server/env.ts'
import build from '#server/services/build.service.ts'
import config from '#server/facades/config.facade.ts'

program.command('module:enable')
    .helpGroup('module')
    .argument('<module>', 'Module to enable')
    .action(async (name) => {
        await config.load()

        await modules.enable(name, { build: env.isProduction })
        
        await build.build()
    })
