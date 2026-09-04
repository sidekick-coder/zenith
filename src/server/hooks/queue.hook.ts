import config from '@sidekick-coder/zenith-kit/server/facades/config'
import di from '#server/facades/di.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import QueueSevice from '#server/services/queue.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class QueueLifecycleHook extends LifecycleHook {
    public order = 4
    
    public async onRegister(): Promise<void> {
        const queue = new QueueSevice({
            debug: config.getOne(['queue.debug', 'app.debug'], false),
            logger: logger.child({ label: 'queue' })
        })
        
        di.set(QueueSevice, queue)
    }

    public async onLoad(): Promise<void> {
        const queue = di.get<QueueSevice>(QueueSevice)

        await queue.load()
    }

    public async onBoot(): Promise<void> {
        const queue = di.get<QueueSevice>(QueueSevice)

        await queue.start()
    }
    
    public async onShutdown(): Promise<void> {
        const queue = di.get<QueueSevice>(QueueSevice)

        queue.stop()
       
    }
}
