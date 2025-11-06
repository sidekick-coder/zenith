import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import cli from '#server/services/cli.service.ts'

program.command('module:build')
    .helpGroup('module')
    .argument('<module>', 'Module to build')
    .option('--prepare', 'Prepare the module before building', false)
    .action(cli.with(['config'], async (name, options) => {
        if (options.prepare) {
            await modules.prepare(name)
        }

        await modules.builder.build(name)
    }))
