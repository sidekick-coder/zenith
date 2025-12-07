import { program } from 'commander'
import { select } from '@inquirer/prompts'
import modules from '#server/facades/modules.facade.ts'
import cli from '#server/services/cli.service.ts'
import logger from '#server/facades/logger.facade.ts'

program.command('module:build')
    .helpGroup('module')
    .option('-p, --prepare <prepare>', 'Prepare the module before building', false)
    .option('-m, --module <module>', 'The name of the module to build')
    .action(cli.with(['config'], async (options) => {
        let name = options.module

        if (!name) {
            const mods = await modules.list()

            name = await select({
                message: 'Select a module to build:',
                choices: mods.map(m => ({
                    name: m.name,
                    value: m.name
                })),
            })
        }

        if (!name) {
            logger.info('No module selected, aborting.')
            return
        }

        if (options.prepare) {
            await modules.prepare(name)
        }

        await modules.builder.build(name)
    }))
