import LifecycleService from '#shared/services/lifecycle.service.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

const lifecycle = new LifecycleService()

const hooks = Object
    .values<any>(import.meta.glob('../hooks/**/*.ts', { eager: true }))
    .map(hook => hook.default || hook) as LifecycleHook[]

lifecycle.add(...hooks)

export default lifecycle
