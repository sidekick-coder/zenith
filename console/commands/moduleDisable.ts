import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import env from '#server/env.ts'

program.command('module:disable')
    .helpGroup('module')
    .argument('<module>', 'Module to disable')
    .action(async (name) => {
        await modules.disable(name, { build: env.isProduction })
    })
