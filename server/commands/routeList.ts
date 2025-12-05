import { program } from 'commander'
import Table from 'cli-table3'
import router from '#server/facades/router.facade.ts'

program.command('route:list')
    .action(async () => {
        const routes = router.list()

        if (routes.length === 0) {
            console.log('No routes found')
            return
        }

        const table = new Table({
            head: ['Module', 'Method', 'Path', ],
            colWidths: [10, 50],
        })

        routes.sort((a, b) => {
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        })

        routes
            .forEach(route => {
                table.push([route.metadata?.module || 'root', route.method, route.path])
            })

        console.log(table.toString())
    })
