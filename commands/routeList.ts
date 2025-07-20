import { program } from 'commander'
import Table from 'cli-table3'
import router from '#facades/router.ts'
import modules from '#services/modules.service.ts'

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
            .map(route => route.seralize())
            .forEach(route => {
                table.push([route.method, route.path, route.filename])
            })

        console.log(table.toString())
    })
