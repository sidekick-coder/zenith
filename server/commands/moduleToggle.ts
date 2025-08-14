import { program } from 'commander'
import modules from '#server/services/modules.service.ts'
import env from '#server/env.ts'

program.command('module:toggle')
    .helpGroup('module')
    .argument('<module>', 'Module to toggle')
    .action(async (name) => {
        await modules.toggle(name, { build: env.isProduction })
    })
