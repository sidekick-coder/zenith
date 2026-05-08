import { confirm } from '@inquirer/prompts'
import { migrator } from '@sidekick-coder/zenith-kit/server'
import arte from '#server/facades/arte.facade.ts'

interface Options {
    step?: number
    source?: string
}

arte.command('migrator:down')
    .need('db', 'migrator', 'plugins')
    .helpGroup('migration')
    .description('Rollback executed migrations')
    .option('-n, --step-number <number>', 'Number of migrations to rollback', Number)
    .option('-s, --source <string>', 'Filter by source name')
    .action(async (options: Options) => {
        const step = options.step ?? 1

        let executed = await migrator.list({ source: options.source })

        executed = executed
            .filter(m => m.executedAt)
            .sort((a, b) => b.name.localeCompare(a.name))
            .slice(0, step)

        if (executed.length === 0) {
            console.log('No migrations to rollback')
            return
        }

        arte.table(executed, [
            { label: 'name', value: 'name' },
            { label: 'source', value: i => i.source || arte.colors.dim('root'), width: 20 },
        ])

        const confirmed = await confirm({
            message: `Rollback ${executed.length} migration(s)?`,
            default: false,
        })

        if (!confirmed) {
            console.log('Cancelled')
            return
        }

        const results = await migrator.down(options.step, { source: options.source })

        arte.table(results.map(m => ({
            name: m.name,
            source: m.source,
            result: m.result === 'success' ? arte.colors.green(m.result) : arte.colors.red(m.result),
            error: m.error ? m.error.message : null,
        })))
    })
