import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import DatabaseService from '#server/services/database.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class DatabaseLifecycleHook extends LifecycleHook {
    public order = 2
    public async onRegister(): Promise<void> {
        const service = new DatabaseService({
            dialect: DatabaseService.memoryDialect,
            debug: config.get('database.debug') || config.get('app.debug'),
        })
        
        di.set(DatabaseService, service)
    }

    public async onLoad(): Promise<void> {
        const db = di.get<DatabaseService>(DatabaseService)

        await db.load()
    }

    public async onShutdown(): Promise<void> {
        const db = di.get<DatabaseService>(DatabaseService)

        await db.destroy()
    }
}