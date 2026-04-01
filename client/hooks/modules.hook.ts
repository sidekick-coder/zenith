import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import modules from '#client/facades/modules.facade.ts'

export default class ModulesLifecycleHook extends LifecycleHook {
    public order = 998

    public async onRegister(): Promise<void> {
        await modules.discover()

        await modules.load()

        this.subhooks = modules.mods.map(mod => mod)
    }
}
