import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import env from '#server/env.ts'
import config from '#server/facades/config.facade.ts'
import build from '#server/services/build.service.ts'

program.command('module:disable')
    .helpGroup('module')
    .argument('<module>', 'Module to disable')
    .action(async (name) => {
        await config.load()
        
        await modules.disable(name, { build: env.isProduction })

        await build.build()
    })
