import { program } from 'commander'
import Table from 'cli-table3'
import router from '#server/facades/router.facade.ts'
import modules from '#server/services/modules.service.ts'
import { basePath } from '#server/utils/paths.ts'
import bootService from '#server/services/boot.service.ts'

program.command('route:list')
    .action(async () => {
        await bootService.routes()
        await bootService.setup()

        const routes = router.list()

        if (routes.length === 0) {
            console.log('No routes found')
            return
        }

        const table = new Table({
            head: ['Method', 'Path', 'Filename'],
            colWidths: [10, 50],
        })

        routes
            .forEach(route => {
                table.push([route.method, route.path, route.filename])
            })

        console.log(table.toString())
    })
