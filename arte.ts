import fs from 'fs'
import { program } from 'commander'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'
// import LifecycleService, { LifecycleHook } from '#server/services/lifecycle.service.ts'

// const lifecycle = new LifecycleService({
//     debug: config.get('lifecycle.debug') || config.get('app.debug')
// })

// const mods = await importAll(basePath('server/hooks'))

// const hooks: LifecycleHook[] = Object.values(mods)
//     .map(m => m.default || m)
//     .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
//     .map((HookClass: any) => new HookClass())
//     .filter(hook => !['app', 'vite'].includes(hook.id)) // Exclude 'app' hook for separate handling

// lifecycle.add(hooks)

// await lifecycle.register()

// await lifecycle.load()

// await lifecycle.boot()

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
        try {
            await importAll(`${modulesPath}/${name}/server/commands`)            
        } catch (error) {
            console.error(`Error loading commands for module ${name}:`, error)
        }
    }
}

program.parse()

process.on('SIGINT', async () => {
    await lifecycle.shutdown()

    process.exit(0)
})


