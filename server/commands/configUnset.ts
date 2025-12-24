import { program } from 'commander'
import config from '#server/facades/config.facade.ts'

program.command('config:unset')
    .helpGroup('config')
    .argument('<key>', 'Configuration key to retrieve')
    .action(async (key) => {
        config.unset(key)
    })
