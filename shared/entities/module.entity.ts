import type ModuleManifest from './moduleManifest.entity.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { BaseEntity } from '#shared/mixins/index.ts'
import { compose, mixin } from '#shared/utils/compose.ts'

interface ModuleUpgradeInfo {
    source: 'git' | 'zip'
    [key: string]: any
}

export default class Module extends compose(BaseEntity, mixin(LifecycleHook)) {
    public id: string
    public name: string
    public enabled: boolean = false
    public dependencies: Record<string, any> = {}
    
    public upgrade_info?: ModuleUpgradeInfo

    public setData(data: Partial<Module | ModuleManifest>) {
        Object.assign(this, data)

        this.hook_id = `module:${this.id}`
    }
}