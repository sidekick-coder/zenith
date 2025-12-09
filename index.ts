import env from '#server/facades/env.facade.ts'
import lifecycle from '#server/facades/lifecycle.facade.ts'
import { importAll } from '#server/utils/importAll.ts'
import { basePath } from '#server/utils/paths.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

env.load()

const mods = await importAll(basePath('server/hooks'))

const hooks: LifecycleHook[] = Object.values(mods)
    .map(m => m.default || m)
    .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
    .map((HookClass: any) => new HookClass())

lifecycle.add(...hooks)

await lifecycle.register()

await lifecycle.load()

await lifecycle.boot()

process.on('SIGINT', async () => {
    await lifecycle.shutdown()
    process.exit(0)
})