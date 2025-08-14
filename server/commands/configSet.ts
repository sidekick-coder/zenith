import { program } from 'commander'
import config from '#server/facades/config.facade.ts'

program.command('config:set')
    .helpGroup('config')
    .argument('<key>', 'Configuration key to retrieve')
    .argument('<value>', 'Value to set')
    .action(async (key, value) => {
        await config.load()

        config.set(key, value, true)

        console.log(value)
    })
