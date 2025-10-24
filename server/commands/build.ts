import { program } from 'commander'
import build from '#server/facades/server.facade.ts'

program.command('build')
    .action(async () => {
        await build.build()
    })
