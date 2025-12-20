import { program } from 'commander'
import config from '#server/facades/config.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('config:list')
    .helpGroup('config')
    .action(async () => {
        const items = await config.list()

        cli.ui.table(items)
    })
