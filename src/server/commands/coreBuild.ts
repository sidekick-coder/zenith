// import build from '#server/facades/server.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte
    .command('build')
    .helpGroup('core')
    .action(async () => {
        const build = await import('#server/facades/server.facade.ts').then((mod) => mod.default)

        await build.build()
    })
