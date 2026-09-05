import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import logger from '#server/facades/logger.facade.ts'
import pluginManager from '#server/facades/pluginManager.ts'

const command = new CliCommand('plugin:commit-checkout')

command
    .need('shell')
    .helpGroup('plugins')
    .option('-p, --plugin-id <pluginId>', 'Plugin ID to list versions for')
    .option('-h, --commit-hash <commitHash>', 'Commit hash to checkout')
    .option('-c, --version-channel <versionChannel>', 'Version channel to set after checkout')
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
        const hash = options.commitHash 
        const versionChannel = options.versionChannel || plugin.version_channel

        if (!plugin) {
            logger.error(`Plugin with ID ${pluginId} not found`)
            return
        }

        await plugin.commits.checkout(hash)

        plugin.set('version_channel', versionChannel)

        console.log(`Checked out commit ${hash} for plugin ${plugin.name} and set version channel to ${versionChannel}`)
    })

export default command
