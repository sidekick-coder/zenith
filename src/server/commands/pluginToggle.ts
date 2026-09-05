import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import pluginManager from '#server/facades/pluginManager.ts'

const command = new CliCommand('plugin:toggle')
    .need('plugins')
    .helpGroup('plugins')
    .requiredOption('-p, --plugin <id>', 'Module name/id/alias to toggle')
    .action(async (options) => {
        const name = options.plugin

        await pluginManager.toggle(name)
    })

export default command
