import config from '@sidekick-coder/zenith-kit/server/facades/config'
import arte from '#server/facades/arte.facade.ts'

arte.command('config:list')
    .helpGroup('config')
    .action(async () => {
        const items = config.list()

        arte.table(items)
    })
