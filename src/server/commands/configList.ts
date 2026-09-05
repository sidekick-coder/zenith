import config from '@sidekick-coder/zenith-kit/server/facades/config'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('config:list')
    .helpGroup('config')
    .action(async () => {
        const items = config.list()

        command.table(items)
    })

export default command
