import { checkbox } from '@inquirer/prompts'
import modules from '#server/facades/modules.facade.ts'
import arte from '#server/facades/arte.facade.ts'

arte.command('module:enable')
    .need('modules')
    .helpGroup('module')
    .option('-m, --module <module>', 'Modules to enable, comma separated')
    .action(async (options) => {
        let mods = [] as string[]

        if (options.module) {
            mods = options.module.split(',')
        }

        if (!mods.length) {
            const all = await modules.list({ enabled: false })

            mods = await checkbox({
                message: 'Select modules to enable',
                choices: all.map(m => ({
                    name: m.name,
                    value: m.name
                }))
            })
        }

        for (const name of mods) {
            await modules.enable(name)
        }
    })
