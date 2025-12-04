import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import DatabaseService from '#server/services/database.service.ts'
import { LifecycleHook } from '#server/services/lifecycle.service.ts'

export default class DatabaseLifecycleHook extends LifecycleHook {
    public id = 'database'

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

    public async onBoot(): Promise<void> {
        
    }
}