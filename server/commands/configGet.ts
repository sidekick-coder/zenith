import { program } from 'commander'
import config from '#server/facades/config.facade.ts'

program.command('config:get')
    .helpGroup('config')
    .argument('<key>', 'Configuration key to retrieve')
    .action(async (key) => {
        await config.load()

        const value = config.get(key)

        console.log(value)
    })
