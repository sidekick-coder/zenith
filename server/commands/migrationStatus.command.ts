import arte from '#server/facades/arte.facade.ts'
import migrator from '#server/facades/migrator.facade.ts'

arte
    .command('migration:status')
    .need('db', 'modules')
    .helpGroup('migration')
    .option('-m, --module <module>', 'Filter by module')
    .option('-r, --root ', 'Run only root migrations')
    .action(async (options) => {
        const items = await migrator.list(options)

        // sort by root then modules 
        items.sort((a, b) => {
            if (a.module === b.module) {
                return a.name.localeCompare(b.name)
            }

            if (!a.module) return -1
            if (!b.module) return 1

            return a.module.localeCompare(b.module)
        })

        arte.table(items, [
            {
                label: 'name',
                value: 'name',
            },
            {
                label: 'module',
                width: 20,
                value: i => i.module || arte.colors.dim('root'),
            },
            {
                label: 'status',
                value: i => i.executedAt ? arte.colors.green('Executed') : arte.colors.red('Pending'),
                width: 20,
            },
        ])
    })

