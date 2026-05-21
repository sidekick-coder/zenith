import { confirm } from '@inquirer/prompts'
import { CliCommand, migrator } from '@sidekick-coder/zenith-kit/server'

interface Options {
    step?: number
    source?: string
}

const command = new CliCommand('migrator:down')

const colors = command.colors

command
    .need('db', 'migrator', 'shell', 'drive')
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

        command.table(executed, [
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
            message: `Rollback ${executed.length} migration(s)?`,
            default: false,
        })

        if (!confirmed) {
            console.log('Cancelled')
            return
        }

        const results = await migrator.rollback({
            source: options.source,
            steps: step 
        })

        command.table(results.map(m => ({
            name: m.name,
            source: m.source,
            result: m.result === 'success' ? colors.green(m.result) : colors.red(m.result),
            error: m.error ? m.error.message : null,
        })))
    })

export default command
