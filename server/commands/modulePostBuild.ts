import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import cli from '#server/services/cli.service.ts'

program.command('module:posbuild')
    .helpGroup('module')
    .argument('<module>', 'Module to build')
    .action(cli.with(['config'], async (name) => {
        await modules.builder.postbuild(name)
    }))
