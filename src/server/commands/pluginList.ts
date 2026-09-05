import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import logger from '#server/facades/logger.facade.ts'
import pluginManager from '#server/facades/pluginManager.ts'

const command = new CliCommand('plugin:list')
    .helpGroup('plugins')
    .action(async () => {
        const plugins = await pluginManager.list()

        if (!plugins.length) {
            logger.info('No plugins found')
            return
        }

        command.table(plugins)
    })

export default command
