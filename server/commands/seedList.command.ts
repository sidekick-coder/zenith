import { program } from 'commander'
import { table } from '#server/utils/cliUi.ts'
import seeder from '#server/facades/seeder.facade.ts'
import logger from '#server/facades/logger.facade.ts'

program.command('seed:list')
    .helpGroup('database')
    .description('List all available seed files')
    .option('-m, --module <moduleName>', 'Filter seeds by module name')
    .option('-r, --root', 'Show only root seeds')
    .option('-n, --name <names...>', 'Filter seeds by name(s)')
    .action(async (options) => {
        const seeds = await seeder.list({
            module: options.module,
            root: options.root,
            name: options.name
        })

        if (seeds.length === 0) {
            logger.warn('No seeds found')
            return
        }

        table(seeds, [
            {
                label: 'Name',
                value: 'name'
            },
            {
                label: 'Module',
                value: 'module',
                width: 20,
            },
        ])
    })
