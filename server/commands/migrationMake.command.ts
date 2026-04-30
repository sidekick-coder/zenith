import fs from 'fs'
import path from 'path'
import { format, } from 'date-fns'
import { basePath } from '@sidekick-coder/zenith-kit/server'
import template from '#server/facades/template.facade.ts'
import modules from '#server/facades/modules.facade.ts'
import arte from '#server/facades/arte.facade.ts'

interface MigrationMakeOptions {
    module?: string
    ts?: boolean
}

arte.command('migration:make')
    .need('modules')
    .argument('<name>', 'Migration name')
    .option('-m, --module <module>', 'Module name')
    .option('--ts', 'Use TypeScript', 'true')
    .action(async (name: string, options: MigrationMakeOptions) => {
        const timesmap = format(new Date(), 'yyyy_MM_dd_HH_mm')

        let target = `${timesmap}_${name}.js`
        let source = basePath('server', 'templates', 'migration.js')

        if (!options.ts) {
            target = `${timesmap}_${name}.js`
            source = basePath('server', 'templates', 'migration.js')
        }

        let filename = basePath('server', 'migrations', target)

        if (options.module) {
            const mod = await modules.findOrFail(options.module)

            filename = mod.makePath('server', 'migrations', target)
        }

        const contents = await template.fromFile(source)

        if (!fs.existsSync(path.dirname(filename))) {
            await fs.promises.mkdir(path.dirname(filename), { recursive: true })
        }

        fs.writeFileSync(filename, contents)

        console.log(`Migration created: ${ path.relative(basePath(), filename) }`)

    })
