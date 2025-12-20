import { program } from 'commander'
import { orderBy } from 'lodash-es'
import type { TableColumn } from '#server/utils/cliUi.ts'
import router from '#server/facades/router.facade.ts'
import { table  } from '#server/utils/cliUi.ts'

program
    .command('route:list')
    .option('--json', 'Output in JSON format')
    .option('--module <module>', 'Filter by module name')
    .option('--sort-by <field>', 'Sort by field (module, path, method)', 'module,path,method')
    .option('--sort-desc <desc>', 'Sort in descending order', '')
    .action(async (options) => {
        let routes = router.list()

        const sortBy: string[] = options['sortBy'].split(',').map((f: string) => f.trim())
        const sortDesc = options['sortDesc']
            .split(',')
            .map((d: string) => d.trim())
            .map((d: string) => d.length > 0)

        if (options.module) {
            routes = routes.filter(r => r.metadata?.module === options.module)
        }

        routes = orderBy(routes, sortBy, sortBy.map((_, i) => sortDesc[i] ? 'desc' : 'asc'))

        if (options.json) {
            console.log(JSON.stringify(routes))
            return
        }

        if (routes.length === 0) {
            console.log('No routes found')
            return
        }

        const columns: TableColumn[] = [
            {
                label: 'Method',
                value: 'method',
                width: 10,
            },
            {
                label: 'Path',
                value: 'path',
            },
        ]

        if (!options.module) {
            columns.unshift({
                label: 'Module',
                value: row => row.metadata?.module || 'unknown',
                width: 10,
            })
        }

        table(routes, columns)
    })
