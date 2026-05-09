import arte from '#server/facades/arte.facade.ts'
import pluginManager from '#server/facades/pluginManager.ts'

arte
    .command('plugin:toggle')
    .need('plugins')
    .helpGroup('plugins')
    .requiredOption('-p, --plugin <id>', 'Module name/id/alias to toggle')
    .action(async (options) => {
        const name = options.plugin

        await pluginManager.toggle(name)
    })
