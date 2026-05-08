import { confirm } from '@inquirer/prompts'
import { migrator } from '@sidekick-coder/zenith-kit/server'
import arte from '#server/facades/arte.facade.ts'

interface Options {
    source?: string
    steps?: number
}

arte.command('migrator:fresh')
    .need('db', 'migrator', 'plugins')
    .helpGroup('migration')
    .description('Rollback all migrations and re-run them')
    .option('-s, --source <string>', 'Filter by source name')
    .option('-n, --steps <number>', 'Number of migrations to rollback before running fresh', Number)
    .action(async (options: Options) => {
        let results = await migrator.fresh({
            source: options.source,
            steps: options.steps,
        })

        results = results.map(m => ({
            name: m.name,
            filename: m.filename,
            source: m.source,
            result: m.result,
            error: m.error ? m.error.message : null,
        }))

        if (!results.length) {
            console.log('No migrations to run')
            return
        }

        arte.table(results)
    })
