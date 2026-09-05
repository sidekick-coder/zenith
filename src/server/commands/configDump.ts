import config from '@sidekick-coder/zenith-kit/server/facades/config'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('config:dump')
    .helpGroup('config')
    .option('-j, --json', 'Output in JSON format', )
    .action(async (options) => {
        const items = Object.entries(config.dump()).map(([key, value]) => ({
            key,
            value 
        }))

        if (options.json) {
            console.log(JSON.stringify(items))
            return
        }

        command.table(items)
    })

export default command
