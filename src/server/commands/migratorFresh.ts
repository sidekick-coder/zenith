import { confirm } from '@inquirer/prompts'
import { migrator } from '@sidekick-coder/zenith-kit/server'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

interface Options {
    source?: string
    steps?: number
}

const command = new CliCommand('migrator:fresh')
    .need('db', 'migrator', 'shell', 'drive')
    .helpGroup('migration')
    .description('Rollback all migrations and re-run them')
    .option('-s, --source <string>', 'Filter by source name')
    .option('-n, --steps <number>', 'Number of migrations to rollback before running fresh', Number)
    .action(async (options: Options) => {
        let toRollback = await migrator.list({ source: options.source })

        toRollback = toRollback
            .filter(m => m.executedAt)
            .sort((a, b) => b.name.localeCompare(a.name))

        if (options.steps !== undefined) {
            toRollback = toRollback.slice(0, options.steps)
        }

        if (toRollback.length === 0) {
            console.log('No migrations to rollback')
            return
        }

        command.table(toRollback, [
            {
                label: 'name',
                value: 'name' 
            },
            {
                label: 'source',
                value: i => i.source || command.colors.dim('root'),
                width: 20 
            },
        ])

        const confirmed = await confirm({
            message: `Rollback ${toRollback.length} migration(s) and re-run them?`,
            default: false,
        })

        if (!confirmed) {
            console.log('Cancelled')
            return
        }

        const results = await migrator.fresh({
            source: options.source,
            steps: options.steps,
        })

        command.table(results.map(m => ({
            name: m.name,
            source: m.source,
            result: m.result === 'success' ? command.colors.green(m.result) : command.colors.red(m.result),
            error: m.error ? m.error.message : null,
        })))
    })

export default command
