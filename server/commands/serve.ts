import { program } from 'commander'
import chokidar from 'chokidar'
import env from '#server/facades/env.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import logger from '#server/facades/logger.facade.ts'
import { importAll } from '#server/utils/index.ts'
import LifecycleService from '#shared/services/lifecycle.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import config from '#server/facades/config.facade.ts'

const lifecycle = new LifecycleService({
    logger: logger.child({ label: 'lifecycle' }),
})

async function init(){
    env.load()

    config.load()

    lifecycle.debug = config.get('lifecycle.debug') || config.get('app.debug')

    const mods = await importAll(basePath('server/hooks'), {
        cache: false
    })
        
    const hooks: LifecycleHook[] = Object.values(mods)
        .map(m => m.default || m)
        .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
        .map((HookClass: any) => new HookClass())
        
    lifecycle.add(...hooks)
}

async function start(){
    await lifecycle.register()
        
    await lifecycle.load()
        
    await lifecycle.boot()
}

async function stop(){
    await lifecycle.shutdown()
}

let isReloading = false

async function reload(filename?: string){
    if (isReloading) {
        return
    }

    isReloading = true

    if (filename) {
        logger.debug(`File changed: ${filename}, reloading server...`)
    }
    
    await init()

    await stop()

    await start()

    isReloading = false
}

program.command('serve')
    .option('-w, --watch', 'Watch for changes and restart server')
    .action(async (options) => {
        await init()

        await start()

        if (!options.watch) {
            return
        }

        const entries = [
            'shared',
            'server',
            'modules',
            '.env'
        ]

        const ignore = [
            '.git', 
            'arte',
            'node_modules',
            'commands',
            'tmp',
            'root',
            'client',
            'client-dist',
            'dist',
            'storage',
            '.volumes',
            'package-lock.json',
            'yarn.lock'
        ]

        const watcher = chokidar.watch(entries.map(entry => basePath(entry)), {
            persistent: true,
            ignoreInitial: true,
            ignored: (path) => {
                if (ignore.some(i => path.includes(i))) {
                    return true
                }

                return false
            }
        })

        watcher.on('change', reload)
        watcher.on('add', reload)
        watcher.on('unlink', reload)

        watcher.on('error', (error) => logger.error('Watcher error:', error))

        watcher.on('ready', () => logger.debug('wathing files'))
    })
