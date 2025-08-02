import { program } from 'commander'
import Table from 'cli-table3'
import modules from '../services/modules.service.ts'

program.command('module:list')
    .helpGroup('module')
    .action(async () => {
        const items = await modules.list()

        if (items.length === 0) {
            console.log('No routes found')
            return
        }

        const table = new Table({
            head: ['Name', 'Path', 'Enabled'],
            colWidths: [10, 50],
        })

        items.forEach(i => {
            table.push([i.name, i.makePath(), i.enabled ? 'Yes' : 'No'])
        })

        console.log(table.toString())
    })
