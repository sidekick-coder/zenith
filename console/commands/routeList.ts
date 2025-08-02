import { program } from 'commander'
import Table from 'cli-table3'
import router from '#server/facades/router.facade.ts'
import modules from '#server/services/modules.service.ts'
import { basePath } from '#server/utils/paths.ts'

program.command('route:list')
    .action(async () => {
        await router.loadDirectory(basePath('router', 'routes'))

        // load module routes
        const mods = await modules.list({ enabled: true })

        for await (const mod of mods) {
            await mod.loadRoutes()
        }

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
