import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import translator from '#server/facades/translator.facade.ts'
import { table } from '#server/utils/cliUi.ts'

const command = new CliCommand('translator:list')
    .need('translator')
    .description('List all translation keys registered in the translator service')
    .helpGroup('translator')
    .action(async () => {
        const items = translator.list()

        table(items)
    })

export default command
