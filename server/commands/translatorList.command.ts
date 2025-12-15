import { program } from 'commander'
import translator from '#server/facades/translator.facade.ts'
import { table } from '#server/utils/cliUi.ts'


program.command('translator:list')
    .description('List all translation keys registered in the translator service')
    .helpGroup('translator')
    .action(async () => {
        const items = translator.list()

        table(items)
    })
