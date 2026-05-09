import arte from '#server/facades/arte.facade.ts'
import seeder from '#server/facades/seeder.facade.ts'
import logger from '#server/facades/logger.facade.ts'

interface SeederListOptions {
    source?: string
    name?: string
}

arte.command('seeder:list')
    .need('seeder', 'plugins')
    .helpGroup('database')
    .description('List all available seed files')
    .option('-s, --source <source>', 'Filter seeds by source')
    .option('-n, --name <names...>', 'Filter seeds by name(s)')
    .action(async (options: SeederListOptions) => {
        const seeds = await seeder.list({
            source: options.source,
            name: options.name,
        })

        if (seeds.length === 0) {
            logger.warn('No seeds found')
            return
        }

        arte.table(seeds, [
            {
                label: 'Name',
                value: 'name'
            },
            {
                label: 'Filename',
                value: 'filename'
            },
            {
                label: 'Source',
                value: 'source',
                width: 20,
            },
        ])
    })
