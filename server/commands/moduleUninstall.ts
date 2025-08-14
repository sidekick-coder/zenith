import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import db from '#server/facades/db.facade.ts'
import config from '#server/facades/config.facade.ts'

program.command('module:uninstall')
    .helpGroup('module')
    .argument('<name>', 'Module name to uninstall')
    .description('Uninstall a module')
    .option('--rollback-migrations', 'Rollback module migrations before uninstalling')
    .option('--build', 'Run build after uninstalling')
    .option('--boot', 'Run boot after uninstalling')
    .action(async (name, options) => {
        await config.load()
        await db.load()
        
        await modules.uninstall(name, {
            rollbackMigrations: options.rollbackMigrations,
            build: options.build,
            boot: options.boot
        })
    })
