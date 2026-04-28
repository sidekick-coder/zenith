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

        arte.table(items, [
            {
                label: 'ID',
                value: 'id'
            },
            {
                label: 'Name',
                value: i => i.name 
            },
            {
                label: 'Path',
                value: i => i.makePath() 
            },
            {
                label: 'Enabled',
                value: i => i.enabled ? 'Yes' : 'No' 
            },
        ])

    })
