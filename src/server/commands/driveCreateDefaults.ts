import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import drive from '#server/facades/drive.facade.ts'

const command = new CliCommand('drive:create-defaults')
    .need('drive')
    .helpGroup('drive')
    .description('Create default drives if they do not exist')
    .action(async () => {
        await drive.createDefaultDrives()

        console.log('Default drives created')
    })

export default command
