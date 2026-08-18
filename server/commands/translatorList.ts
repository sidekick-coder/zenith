import translator from '#server/facades/translator.facade.ts'
import { table } from '#server/utils/cliUi.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('translator:list')
    .need('translator')
    .description('List all translation keys registered in the translator service')
    .helpGroup('translator')
    .action(async () => {
        const items = translator.list()

        table(items)
    })
