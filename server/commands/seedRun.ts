import { program } from 'commander'
import { confirm } from '@inquirer/prompts'
import seeder from '#server/facades/seeder.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import { table } from '#server/utils/cliUi.ts'

program.command('seed:run')
    .helpGroup('database')
    .description('Run database seed files')
    .option('-m, --module <moduleName>', 'Filter seeds by module name')
    .option('-r, --root', 'Run only root seeds')
    .option('-n, --name <names...>', 'Filter seeds by name(s)')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (options) => {
        const seeds = await seeder.list({
            module: options.module,
            root: options.root,
            name: options.name
        })

        if (seeds.length === 0) {
            logger.info('No seeds found matching the filters')
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

        if (!options.yes) {
            const confirmation = await confirm({ 
                message: `Do you want to run ${seeds.length} seed(s)?`,
                default: false
            })

            if (!confirmation) {
                logger.info('Cancelled')
                return
            }
        }

        const results = await seeder.run({
            module: options.module,
            root: options.root,
            name: options.name
        })

        let successCount = 0
        let failedCount = 0

        for (const result of results) {
            const moduleInfo = result.module ? ` (${result.module})` : ' (root)'
            
            if (result.result === 'success') {
                logger.info(`✓ ${result.filename}${moduleInfo}`)
                successCount++
            }
            
            if (result.result === 'failed') {                
                logger.error(`Error running ${result.filename}${moduleInfo}`, result.error)
                
                failedCount++
            }
        }
        
        logger.info(`Completed: ${successCount} succeeded, ${failedCount} failed`)
    })
