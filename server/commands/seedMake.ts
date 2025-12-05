import fs from 'fs'
import path from 'path'
import { program } from 'commander'
import { basePath } from '#server/utils/paths.ts'
import template from '#server/facades/template.facade.ts'
import modules from '#server/facades/modules.facade.ts'

program.command('seed:make')
    .argument('<name>', 'Seed name')
    .option('-m, --module <module>', 'Module name')
    .action(async (name, options) => {
        const seedName = `${name}.seed.ts`

        let filename = basePath('server', 'seeds', seedName)

        if (options.module) {
            const mod = await modules.findOrFail(options.module)

            filename = mod.makePath('server', 'seeds', seedName)
        }

        const contents = await template.fromFile(basePath('server', 'templates', 'seed.ts'))

        if (!fs.existsSync(path.dirname(filename))) {
            await fs.promises.mkdir(path.dirname(filename), { recursive: true })
        }

        fs.writeFileSync(filename, contents)

        console.log(`Seed created: ${path.relative(basePath(), filename)}`)
    })
