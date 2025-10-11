import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import env from '#server/env.ts'
import config from '#server/facades/config.facade.ts'
import build from '#server/services/build.service.ts'

program.command('module:disable')
    .helpGroup('module')
    .argument('<module>', 'Module to disable')
    .option('-b, --build', 'Run build after disabling the module', false)
    .action(async (name, options) => {
        await config.load()
        
        await modules.disable(name)

        if (options.build) {
            await build.build()
        }
    })
