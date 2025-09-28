import fs from 'fs'
import path from 'path'
import { program } from 'commander'
import { format, } from 'date-fns'
import { basePath } from '#server/utils/paths.ts'
import template from '#server/services/template.service.ts'
import modules from '#server/services/modules.service.ts'

program.command('migration:make')
    .argument('<name>', 'Migration name')
    .option('-m, --module <module>', 'Module name')
    .action(async (name, options) => {
        const timesmap = format(new Date(), 'yyyy_MM_dd_HH_mm')

        const migrationName = `${timesmap}_${name}.ts`

        let filename = basePath('server', 'migrations', migrationName)

        if (options.module) {
            const mod = await modules.findOrFail(options.module)

            filename = mod.makePath('server', 'migrations', migrationName)
        }

        const contents = await template.fromFile(basePath('server', 'templates', 'migration.ts'))

        if (!fs.existsSync(path.dirname(filename))) {
            await fs.promises.mkdir(path.dirname(filename), { recursive: true })
        }

        fs.writeFileSync(filename, contents)

        console.log(`Migration created: ${ path.relative(basePath(), filename) }`)

    })
