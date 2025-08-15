import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import db from '#server/facades/db.facade.ts'
import config from '#server/facades/config.facade.ts'
import build from '#server/services/build.service.ts'
import env from '#server/env.ts'

program.command('module:install')
    .helpGroup('module')
    .argument('<repo>', 'GitHub repository (owner/repo)')
    .description('Install a module from a GitHub repository')
    .option('--enable', 'Enable the module after installation')
    .option('--npm', 'Run npm install')
    .option('--migrate', 'Run migrations after installation', false)
    .option('--seeds', 'Run seeds after installation', false)
    .option('--build', 'Run build after installation')
    .action(async (repo, options) => {        
        await modules.install(repo, {
            enable: options.enable,
            npm: options.npm,
            migrate: options.migrate,
            seeds: options.seeds
        })

        if (env.isProduction || options.build) {
            // Rebuild the application if in production or if --build is specified
            await build.all()
        }
    })
