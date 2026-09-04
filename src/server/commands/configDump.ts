import config from '@sidekick-coder/zenith-kit/server/facades/config'
import arte from '#server/facades/arte.facade.ts'

arte.command('config:dump')
    .helpGroup('config')
    .option('-j, --json', 'Output in JSON format', )
    .action(async (options) => {
        const items = Object.entries(config.dump()).map(([key, value]) => ({
            key,
            value 
        }))

        if (options.json) {
            console.log(JSON.stringify(items))
            return
        }

        arte.table(items)
    })
