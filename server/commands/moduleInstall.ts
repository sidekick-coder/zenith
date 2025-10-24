import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import config from '#server/facades/config.facade.ts'
import build from '#server/facades/server.facade.ts'

program.command('module:install')
    .helpGroup('module')
    .argument('<repo>', 'GitHub repository (owner/repo)')
    .description('Install a module from a GitHub repository')
    .option('-e, --enable', 'Enable the module after installation')
    .option('-n, --npm', 'Run npm install')
    .option('-m, --migrate', 'Run migrations after installation', false)
    .option('-s, --seed', 'Run seeds after installation', false)
    .option('-b, --build', 'Run build after installation')
    .action(async (repo, options) => {
        await config.load()

        await modules.install(repo, {
            enable: options.enable,
            npm: options.npm,
            migrate: options.migrate,
            seeds: options.seeds
        })

        if (options.enable) {
            await build.build()
        }

    })
