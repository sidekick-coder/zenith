import { CliCommand } from '@sidekick-coder/zenith-kit/server'
import logger from '#server/facades/logger.facade.ts'
import pluginManager from '#server/facades/pluginManager.ts'

const command = new CliCommand('plugin:git-fetch')

command
    .need('shell')
    .helpGroup('plugins')
    .option('-p, --plugin-id <pluginId>', 'Plugin ID to list versions for')
    .action(async (options) => {
        let pluginId = options.pluginId

        if (!pluginId) {
            const plugins = pluginManager.list()

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

        const response = await plugin.git.fetchAll()

        console.log(response)
    })

export default command
