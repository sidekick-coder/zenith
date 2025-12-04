import { program } from 'commander'
import Table from 'cli-table3'
import router from '#server/facades/router.facade.ts'
import server from '#server/facades/server.facade.ts'
import config from '#server/facades/config.facade.ts'

program.command('route:list')
    .action(async () => {
        await server.booter.setup()

        const routes = router.list()

        if (routes.length === 0) {
            console.log('No routes found')
            return
        }

        const table = new Table({
            head: ['Module', 'Method', 'Path', ],
            colWidths: [10, 50],
        })

        routes
            .forEach(route => {
                table.push([route.module || 'root', route.method, route.path])
            })

        console.log(table.toString())
    })
