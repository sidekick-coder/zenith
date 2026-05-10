import arte from '#server/facades/arte.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import pluginManager from '#server/facades/pluginManager.ts'

arte
    .command('plugin:list')
    .helpGroup('plugins')
    .action(async () => {
        const plugins = await pluginManager.list()

        if (!plugins.length) {
            logger.info('No plugins found')
            return
        }

        arte.table(plugins)
    })
