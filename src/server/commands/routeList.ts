import { orderBy } from 'lodash-es'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import type { TableColumn } from '#server/utils/cliUi.ts'
import router from '#server/facades/router.facade.ts'
import { table } from '#server/utils/cliUi.ts'

const command = new CliCommand('route:list')
    .helpGroup('router')
    .need('router', 'modules', 'plugins')
    .option('--json', 'Output in JSON format')
    .option('--module,-m <module>', 'Filter by module name')
    .option('--sort-by <field>', 'Sort by field (module, path, method)')
    .option('--sort-desc <desc>', 'Sort in descending order')
    .action(async (options: any) => {
        let routes = router.list()

        routes = routes.map(r => ({
            method: r.method,
            path: r.path,
            module: r.metadata?.module || 'unknown',
            metadata: r.metadata,
        }))

        let sortBy: string[] = ['module']
        let sortDesc: ('asc'|'desc')[] = ['desc']

        if (options.module) {
            routes = routes.filter(r => r.metadata?.module === options.module)
        }


        if (options['sortBy']) {
            sortBy = options['sortBy'].split(',').map((f: string) => f.trim())
        }

        if (options['sortDesc']) {
            sortDesc = options['sortDesc'].split(',').map((d: string) => d.trim())
        }

        routes = orderBy(routes, sortBy, sortDesc)

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
                width: 15,
            })
        }

        table(routes, columns)
    })

export default command
