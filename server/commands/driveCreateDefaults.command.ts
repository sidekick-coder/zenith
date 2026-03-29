import drive from '#server/facades/drive.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte.command('drive:create-defaults')
    .need('drive')
    .helpGroup('drive')
    .description('Create default drives if they do not exist')
    .action(async () => {
        await drive.createDefaultDrives()

        console.log('Default drives created')
    })
