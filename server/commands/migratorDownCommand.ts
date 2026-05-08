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
        let results = await migrator.down(options.step, { source: options.source })

        results = results.map(m => ({
            name: m.name,
            filename: m.filename,
            source: m.source,
            result: m.result,
            error: m.error ? m.error.message : null,
        }))


        if (results.length === 0) {
            console.log('No migrations to rollback')
            return
        }

        arte.table(results)
    })
