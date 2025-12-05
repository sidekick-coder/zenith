import { program } from 'commander'
import modules from '#server/facades/modules.facade.ts'
import build from '#server/facades/server.facade.ts'

program.command('module:uninstall')
    .helpGroup('module')
    .argument('<name>', 'Module name to uninstall')
    .description('Uninstall a module')
    .option('--rollback', 'Rollback module migrations before uninstalling')
    .option('--build', 'Run build after uninstalling')
    .action(async (name, options) => {        
        await modules.uninstall(name, { rollback: options.rollback, })

        await build.build()
    })
