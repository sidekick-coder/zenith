import { program } from 'commander'
import build from '#server/services/build.service.ts'

program.command('build')
    .action(async () => {
        await build.all()
    })
