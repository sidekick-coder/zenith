import { program } from 'commander'
import config from '#server/facades/config.facade.ts'

program.command('config:set')
    .helpGroup('config')
    .argument('<key>', 'Configuration key to retrieve')
    .argument('<value>', 'Value to set, use :bool suffix for boolean values (e.g. true:bool)')
    .action(async (key: string, value: string) => {
        let configValue: any = value

        if (value.startsWith('bool:')) {
            configValue = value.replace('bool:', '').trim() === 'true'
        }

        config.set(key, configValue)

        console.log(configValue)
    })
