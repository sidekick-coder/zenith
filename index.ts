import config from '#server/facades/config.facade.ts'
import LifecycleService, { LifecycleHook } from '#server/services/lifecycle.service.ts'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'

const lifecycle = new LifecycleService({
    debug: config.getOne(['app.debug', 'lifecycle.debug'], false)
})

const mods = await importAll(basePath('server/hooks'))

const hooks: LifecycleHook[] = Object.values(mods)
    .map(m => m.default || m)
    .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
    .map((HookClass: any) => new HookClass())

lifecycle.add(hooks)

await lifecycle.register()

await lifecycle.load()

await lifecycle.boot()

process.on('SIGINT', async () => {
    await lifecycle.shutdown()
    process.exit(0)
})