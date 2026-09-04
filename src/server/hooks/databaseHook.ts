import container from '@sidekick-coder/zenith-kit/server/facades/container'
import DatabaseGateway from '@sidekick-coder/zenith-kit/server/gateways/DatabaseGateway'
import LifecycleHook from '@sidekick-coder/zenith-kit/shared/entities/LifecycleHook'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import emmitter from '#server/facades/emmitter.facade.ts'
import logger from '#server/facades/logger.facade.ts'
import DatabaseService from '#server/services/database.service.ts'

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

        container.set(DatabaseService, service)

        if (!config.has('database')) {
            config.set('setup.need_database', true, 'runtime')

            service.logger.warn('using temporary connection, this is used only for setup, please configure a database connection')
        }
    }

    public async onLoad(): Promise<void> {

        const service = container.get<DatabaseService>(DatabaseService)

        await service.load(service.defaultConnection || 'memory')

        emmitter.emit('database:ready')

        container.set(DatabaseGateway, container.get(DatabaseService))
    }

    public async onShutdown(): Promise<void> {
        const db = container.get<DatabaseService>(DatabaseService)

        await db.destroy()
    }
}
