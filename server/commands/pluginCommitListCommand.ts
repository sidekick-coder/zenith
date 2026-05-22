import { CliCommand } from '@sidekick-coder/zenith-kit/server'
import logger from '#server/facades/logger.facade.ts'
import pluginManager from '#server/facades/pluginManager.ts'

const command = new CliCommand('plugin:commit-list')

command
    .need('shell')
    .helpGroup('plugins')
    .option('-p, --plugin-id <pluginId>', 'Plugin ID to list versions for')
    .option('-c, --cursor <cursor>', 'Cursor for pagination')
    .action(async (options) => {
        const plugins = pluginManager.list()

        let pluginId = options.pluginId

        if (!pluginId) {
            pluginId = await command.inquirer.select({
                message: 'Select a plugin to list versions for',
                choices: plugins.map(p => ({
                    name: `${p.name} (${p.id})`,
                    value: p.id
                })),
            })
        }

        const plugin = pluginManager.findOrFail(pluginId)

        if (!plugin) {
            logger.error(`Plugin with ID ${pluginId} not found`)
            return
        }

        const response = await plugin.commits.list({ cursor: options.cursor, })

        command.table(response.items)

        command.object({
            'Previous cursor': response.cursor_previous || 'None',
            'Next cursor': response.cursor_next || 'None',
        })
    })

export default command
