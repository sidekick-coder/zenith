import LifecycleService from '#shared/services/lifecycle.service.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

const lifecycle = new LifecycleService()

const files = Object.entries(import.meta.glob('../hooks/**/*.ts', { eager: true })) as [ string, any ][]

const hooks = [] as LifecycleHook[]

for (const [key, value] of files) {
    const hookClass: any = value.default || value
    const hook = new hookClass() as LifecycleHook

    hook.hook_id = key
    
    hooks.push(hook)
}

lifecycle.add(...hooks)

export default lifecycle
