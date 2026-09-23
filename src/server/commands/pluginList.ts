import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import logger from '@sidekick-coder/zenith-kit/server/facades/logger'
import pluginManager from '#server/facades/pluginManager.ts'

const command = new CliCommand('plugin:list')
    .helpGroup('plugins')
    .option('-j, --json', 'Output in JSON format')
    .action((options) => {
        const plugins = pluginManager.list()

        if (!plugins.length) {
            logger.info('No plugins found')
            return
        }

        if (options.json) {
            console.log(JSON.stringify(plugins, null, 2))
            return
        }

        command.table(plugins, [
            {
                label: 'ID',
                value: 'id'
            },
            {
                label: 'Name',
                value: 'name'
            },
            {
                label: 'Enabled',
                value: (plugin) => (plugin.enabled ? 'Yes' : 'No')
            }
        ])
    })

export default command
