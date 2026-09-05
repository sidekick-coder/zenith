import config from '@sidekick-coder/zenith-kit/server/facades/config'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('config:unset')
    .helpGroup('config')
    .argument('<key>', 'Configuration key to retrieve')
    .action(async (key) => {
        config.unset(key)
    })

export default command
