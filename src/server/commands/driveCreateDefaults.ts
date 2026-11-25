import { CliCommand } from '@sidekick-coder/zenith-kit/server'
import { drive } from '@sidekick-coder/zenith-kit/server'

const command = new CliCommand('drive:create-defaults')
    .need('drive')
    .helpGroup('drive')
    .description('Create default drives if they do not exist')
    .action(async () => {
        await drive.createDefaultDrives()

        console.log('Default drives created')
    })

export default command
