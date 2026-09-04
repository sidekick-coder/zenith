import config from '@sidekick-coder/zenith-kit/server/facades/config'
import arte from '#server/facades/arte.facade.ts'

arte.command('config:get')
    .helpGroup('config')
    .argument('<key>', 'Configuration key to retrieve')
    .action(async (key) => {
        const value = config.get(key)

        console.log(value)
    })
