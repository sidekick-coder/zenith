import fs from 'fs'
import path from 'path'
import { format, } from 'date-fns'
import { basePath } from '@sidekick-coder/zenith-kit/server'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import template from '#server/facades/template.facade.ts'

interface MigrationMakeOptions {
    module?: string
    ts?: boolean | string
}

const command = new CliCommand('migrator:make')

command
    .helpGroup('migrator')
    .argument('<name>', 'Migration name')
    .option('-m, --module <module>', 'Module name')
    .option('-t, --ts <ts>', 'Use TypeScript', 'true')
    .action(async (name: string, options: MigrationMakeOptions) => {
        const timesmap = format(new Date(), 'yyyy_MM_dd_HH_mm')
        const ts = options.ts === 'true' || options.ts === true

        let target = `${timesmap}_${name}.ts`
        let source = basePath('server', 'templates', 'migration.ts')

        if (!ts) {
            target = `${timesmap}_${name}.js`
            source = basePath('server', 'templates', 'migration.js')
        }

        const filename = basePath('server', 'migrations', target)

        const contents = await template.fromFile(source)

        if (!fs.existsSync(path.dirname(filename))) {
            await fs.promises.mkdir(path.dirname(filename), { recursive: true })
        }

        fs.writeFileSync(filename, contents)

        console.log(`Migration created: ${path.relative(basePath(), filename)}`)

    })

export default command
