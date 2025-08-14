import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import db from '#server/facades/db.facade.ts'
import config from '#server/facades/config.facade.ts'

program.command('module:install')
    .helpGroup('module')
    .argument('<repo>', 'GitHub repository (owner/repo)')
    .description('Install a module from a GitHub repository')
    .option('--enable', 'Enable the module after installation')
    .option('--npm', 'Run npm install')
    .option('--migrations', 'Run migrations after installation', false)
    .option('--seeds', 'Run seeds after installation', false)
    .action(async (repo, options) => {
        await config.load()
        await db.load()
        
        await modules.install(repo, {
            enable: options.enable,
            npm: options.npm,
            build: options.build,
            boot: options.boot,
            migrations: options.migrations,
            seeds: options.seeds
        })
    })
