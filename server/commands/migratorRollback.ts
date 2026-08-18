import { confirm } from '@inquirer/prompts'
import { migrator } from '@sidekick-coder/zenith-kit/server'
import arte from '#server/facades/arte.facade.ts'

interface Options {
    source?: string
}

arte.command('migrator:rollback')
    .need('db', 'migrator', 'shell', 'drive')
    .helpGroup('migration')
    .description('Rollback pending migrations')
    .option('-s, --source <string>', 'Filter by source name')
    .action(async (options: Options) => {
        let executed = await migrator.list({ source: options.source })

        executed = executed
            .filter(m => !!m.executedAt)
            .sort((a, b) => a.name.localeCompare(b.name))

        if (executed.length === 0) {
            console.log('No pending migrations')
            return
        }

        arte.table(executed, [
            {
                label: 'name',
                value: 'name' 
            },
            {
                label: 'source',
                value: i => i.source || arte.colors.dim('root'),
                width: 20 
            },
        ])

        const confirmed = await confirm({
            message: `Rollback ${executed.length} migration(s)?`,
            default: true,
        })

        if (!confirmed) {
            console.log('Cancelled')
            return
        }

        const results = await migrator.rollback({ source: options.source })

        arte.table(results.map(m => ({
            name: m.name,
            source: m.source,
            result: m.result === 'success' ? arte.colors.green(m.result) : arte.colors.red(m.result),
            error: m.error ? m.error.message : null,
        })))
    })
