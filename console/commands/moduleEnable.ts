import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import env from '#server/env.ts'

program.command('module:enable')
    .helpGroup('module')
    .argument('<module>', 'Module to enable')
    .action(async (name) => {
        await modules.enable(name, { build: env.isProduction })
    })
