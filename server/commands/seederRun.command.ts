import { confirm } from '@inquirer/prompts'
import arte from '#server/facades/arte.facade.ts'
import seeder from '#server/facades/seeder.facade.ts'
import logger from '#server/facades/logger.facade.ts'

interface SeederRunOptions {
    source?: string
    name?: string | string[]
    yes?: boolean
}

arte.command('seeder:run')
    .need('seeder', 'database')
    .helpGroup('database')
    .description('Run database seed files')
    .option('-s, --source <source>', 'Filter seeds by module name')
    .option('-n, --name <names...>', 'Filter seeds by name(s)')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (options: SeederRunOptions) => {
        const seeds = await seeder.list({
            name: options.name,
            source: options.source,
        })

        if (seeds.length === 0) {
            logger.info('No seeds found matching the filters')
            return
        }

        arte.table(seeds)

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
            source: options.source,
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
