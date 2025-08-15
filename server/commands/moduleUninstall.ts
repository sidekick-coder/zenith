import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import env from '#server/env.ts'
import build from '#server/services/build.service.ts'

program.command('module:uninstall')
    .helpGroup('module')
    .argument('<name>', 'Module name to uninstall')
    .description('Uninstall a module')
    .option('--rollback', 'Rollback module migrations before uninstalling')
    .option('--build', 'Run build after uninstalling')
    .action(async (name, options) => {        
        await modules.uninstall(name, { rollback: options.rollback, })

        if (env.isProduction || options.build) {
            // Rebuild the application if in production or if --build is specified
            await build.all()
        }
    })
