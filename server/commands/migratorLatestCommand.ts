import { migrator } from '@sidekick-coder/zenith-kit/server'
import arte from '#server/facades/arte.facade.ts'

interface Options {
    source?: string
}

arte.command('migrator:latest')
    .need('db', 'migrator', 'plugins')
    .helpGroup('migration')
    .description('Run all pending migrations')
    .option('-s, --source <string>', 'Filter by source name')
    .action(async (options: Options) => {
        let results = await migrator.latest({ source: options.source })

        results = results.map(m => ({
            name: m.name,
            filename: m.filename,
            source: m.source,
            result: m.result,
            error: m.error ? m.error.message : null,
        }))

        if (results.length === 0) {
            console.log('No pending migrations')
            return
        }

        arte.table(results)
    })
