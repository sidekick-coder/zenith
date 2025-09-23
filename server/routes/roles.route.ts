import rootRouter from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import { list } from '#server/queries/index.ts'
import Role from '#shared/entities/role.entity.ts'

const router = rootRouter.use(authMiddleware)
    .prefix('/api/roles')
    .group()

router.get('/', async () => {
    const rows = await list('roles', { serialize: r => new Role(r) })

    return rows
})