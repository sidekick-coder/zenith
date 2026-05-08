import { migrator } from '@sidekick-coder/zenith-kit/server'
import { orderBy } from 'lodash-es'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('migrator:status')
    .need('db', 'migrator', 'plugins')
    .helpGroup('migration')
    .option('-s, --source <source>', 'Filter by source')
    .option('-r, --root ', 'Run only root migrations')
    .action(async (options: any) => {
        let items: any = await migrator.list(options)

        items = items.map(i => ({
            name: i.name,
            source: i.source,
            status: i.executedAt ? 'Executed' : 'Pending',
        }))

        items = orderBy(items, ['status', 'source', 'name'], ['asc', 'desc', 'asc'])

        arte.table(items, [
            {
                label: 'name',
                value: 'name',
            },
            {
                label: 'source',
                width: 20,
                value: i => i.source || arte.colors.dim('root'),
            },
            {
                label: 'status',
                value: i => i.status === 'Executed' ? arte.colors.green(i.status) : arte.colors.yellow(i.status),
                width: 20,
            },
        ])
    })

