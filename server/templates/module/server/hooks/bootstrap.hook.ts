import path from 'path'
import di from '#server/facades/di.facade.ts'
// import queue from '#server/facades/queue.facade.ts'
import RouterSevice from '#server/services/router.service.ts'
import RouterRegister from '#server/services/routerRegister.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class extends LifecycleHook {
    public async onLoad(): Promise<void> {
        const router = di.get<RouterRegister>(RouterSevice)

        router.addDir(path.resolve(import.meta.dirname, '../routes'))

        // if you have any jobs, you can add them to the queue here
        // queue.addDir(path.resolve(import.meta.dirname, '../jobs'))
    }
}
