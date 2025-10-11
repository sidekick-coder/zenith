import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import build from '#server/services/build.service.ts'
import config from '#server/facades/config.facade.ts'

program.command('module:enable')
    .helpGroup('module')
    .argument('<module>', 'Module to enable')
    .option('-b, --build', 'Build after enabling the module', false)
    .action(async (name, options) => {
        await config.load()

        await modules.enable(name)

        if (options.build){
            await build.build()
        }
        
    })
