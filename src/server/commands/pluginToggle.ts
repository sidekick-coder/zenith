import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import { pluginService } from '@sidekick-coder/zenith-kit/server'

const command = new CliCommand('plugin:toggle')
    .need('plugins')
    .helpGroup('plugins')
    .requiredOption('-p, --plugin <id>', 'Module name/id/alias to toggle')
    .action(async (options) => {
        const id = options.plugin

        const plugin = await pluginService.repository.findByIdOrFail(id)

        plugin.toggle()
    })

export default command
