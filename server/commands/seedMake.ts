import fs from 'fs'
import path from 'path'
import arte from '#server/facades/arte.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import template from '#server/facades/template.facade.ts'

arte.command('seed:make')
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
