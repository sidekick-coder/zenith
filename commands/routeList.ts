import { program } from 'commander';
import modules from '../services/modules.service.ts';
import router from '../services/router.service.ts';
import Table from 'cli-table3';

program.command('route:list')
    .action(async () => {
        await router.load()

        const routes = router.list()

        if (routes.length === 0) {
            console.log('No routes found');
            return;
        }

        const table = new Table({
            head: ['Method', 'Path', 'Filename'],
            colWidths: [10, 50],
        })

        routes.forEach(route => {
            table.push([route.method, route.path, route.filename]);
        });

        console.log(table.toString());
    });
