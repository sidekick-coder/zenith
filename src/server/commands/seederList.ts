import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import seeder from '#server/facades/seeder.facade.ts'
import logger from '#server/facades/logger.facade.ts'

interface SeederListOptions {
    source?: string
    name?: string
}

const command = new CliCommand('seeder:list')
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

        command.table(seeds, [
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

export default command
