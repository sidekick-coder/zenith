import Table from 'cli-table3'
import modules from '#server/facades/modules.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('module:list')
    .need('modules')
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
