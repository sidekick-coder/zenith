import build from '#server/facades/server.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('build')
    .helpGroup('core')
    .action(async () => {
        await build.build()
    })
