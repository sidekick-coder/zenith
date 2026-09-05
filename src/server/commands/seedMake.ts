import fs from 'fs'
import path from 'path'
import { basePath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import { CliCommand } from '@sidekick-coder/zenith-kit/server/services/CliService'
import template from '#server/facades/template.facade.ts'

const command = new CliCommand('seed:make')
    .helpGroup('seeder')
    .argument('<name>', 'Seed name')
    .action(async (name) => {
        const seedName = `${name}.seed.ts`

        const filename = basePath('server', 'seeds', seedName)


        const contents = await template.fromFile(basePath('server', 'templates', 'seed.ts'))

        if (!fs.existsSync(path.dirname(filename))) {
            await fs.promises.mkdir(path.dirname(filename), { recursive: true })
        }

        fs.writeFileSync(filename, contents)

        console.log(`Seed created: ${path.relative(basePath(), filename)}`)
    })

export default command
