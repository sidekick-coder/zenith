import DatabaseConnection from '#server/entities/databaseConnection.entity.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import root from '#server/facades/router.facade.ts'
import RouterResourceConfigService from '#server/services/routerResourceConfig.service.ts'
import { AuthorizationMiddleware } from '#server/middlewares/authorization.middleware.ts'

const router = root.prefix('/api/database-connections')
    .use(authMiddleware)
    .group()

const read = AuthorizationMiddleware.create({
    action: 'read',
    resource: 'Config',
    conditions: {
        key: 'database.connections'
    }
})

const resource = new RouterResourceConfigService(DatabaseConnection, {
    middleware: { all: read },
    except: ['store', 'update', 'destroy'],
})

resource.register(router)