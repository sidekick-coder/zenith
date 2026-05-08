import { container } from '@sidekick-coder/zenith-kit/server'
import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import DatabaseService from '#server/services/database.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class DatabaseLifecycleHook extends LifecycleHook {
    public order = 2
    public hook_aliases = ['database', 'db']

    public async onRegister(): Promise<void> {

        const defaultConnection = config.get('database.default', 'memory')
        const connections = config.get('database.connections', {})

        connections['memory'] = { dialect: 'memory', }

        const service = DatabaseService.createTemporatyDatabase()

        service.defaultConnection = defaultConnection
        service.connections = connections

        service.logger = logger.child({ label: 'db' })
        service.debug = config.getOne(['database.debug', 'app.debug'], false)

        di.set(DatabaseService, service)

        if (!config.has('database')) {
            config.set('setup.need_database', true, 'runtime')

            service.logger.warn('using temporary connection, this is used only for setup, please configure a database connection')
        }
    }

    public async onLoad(): Promise<void> {

        const service = di.get<DatabaseService>(DatabaseService)

        await service.load(service.defaultConnection || 'memory')

        emmitter.emit('database:ready')

        container.set('database', di.get(DatabaseService))
    }

    public async onShutdown(): Promise<void> {
        const db = di.get<DatabaseService>(DatabaseService)

        await db.destroy()
    }
}
