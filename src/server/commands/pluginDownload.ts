import { logger } from '@sidekick-coder/zenith-kit/server'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import pluginDownloadService from '#server/facades/pluginDownloadService.ts'

const command = new CliCommand('plugin:download')
    .helpGroup('plugins')
    .requiredOption('-r, --repository <repository>', 'The git repository URL of the plugin to download')
    .option('--ssh-key-file <sshKeyFile>', 'Path to the SSH key file for accessing the repository')
    .option('--ssh-key <sshKey>', 'SSH private key content for accessing the repository')
    .action(async (options) => {
        const [error] = await $try(() => pluginDownloadService.download(options))

        if (error) {
            logger.error(error)
        }
    })

export default command
