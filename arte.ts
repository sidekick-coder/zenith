import fs from 'fs'
import { program } from 'commander'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'

// unhandled errors
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason)
})

await config.load()

await importAll(basePath('server/commands'))

const modulesPath = basePath('modules')
const moduleNames = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

for await (const name of moduleNames) {
    const enabled = config.get(`modules.enabled.${name}`, false)
    
    if (!enabled) {
        continue
    }
    
    if (fs.existsSync(`${modulesPath}/${name}/server/commands`)) {
        await importAll(`${modulesPath}/${name}/server/commands`)
    }
}

program.parse()
