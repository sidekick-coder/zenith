import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import PluginMarketplaceService from '#server/services/pluginMarketplace.service.ts'

const command = new CliCommand('plugin:marketplace-list')
    .helpGroup('plugins')
    .option('-j, --json', 'Output the complete marketplace entries as JSON')
    .action(async (options) => {
        const entries = await PluginMarketplaceService.create().list()

        if (options.json) {
            console.log(JSON.stringify(entries, null, 2))
            return
        }

        command.table(entries, [
            {
                label: 'Repository',
                value: 'repository',
            },
            {
                label: 'Branch',
                value: 'branch',
            },
            {
                label: 'Version',
                value: entry => entry.version || '-',
            },
            {
                label: 'Hash',
                value: entry => entry.hash?.slice(0, 7) || '-',
            },
            {
                label: 'Error',
                value: entry => entry.error || '-',
            },
        ])
    })

export default command
