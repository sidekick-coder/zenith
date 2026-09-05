import config from '@sidekick-coder/zenith-kit/server/facades/config'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('config:get')
    .helpGroup('config')
    .argument('<key>', 'Configuration key to retrieve')
    .action(async (key) => {
        const value = config.get(key)

        console.log(value)
    })

export default command
