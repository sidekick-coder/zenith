import { program } from 'commander'
import modules from '#server/facades/modules.facade.ts'
import cli from '#server/services/cli.service.ts'

program.command('module:build')
    .helpGroup('module')
    .option('-p, --prepare <prepare>', 'Prepare the module before building', false)
    .argument('<module>', 'Module to build')
    .action(cli.with(['config'], async (name, options) => {
        if (options.prepare) {
            await modules.prepare(name)
        }

        await modules.builder.build(name)
    }))
