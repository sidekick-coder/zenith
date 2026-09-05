import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'

const command = new CliCommand('build')
    .helpGroup('core')
    .action(async () => {
        const build = await import('#server/facades/server.facade.ts').then((mod) => mod.default)

        await build.build()
    })

export default command
