import arte from '#server/facades/arte.facade.ts'
import pluginDownloadService from '#server/facades/pluginDownloadService.ts'

arte
    .command('plugin:download')
    .helpGroup('plugins')
    .requiredOption('-r, --repository <repository>', 'The git repository URL of the plugin to download')
    .action(async (options) => {
        const [error] = await $try(() => pluginDownloadService.download(options))

        if (error) {
            console.error(`Failed to download plugin: ${error.message}`)
            process.exit(1)
        }

        console.log('Plugin downloaded successfully')
    })
