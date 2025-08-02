import path from 'path'
import migrator from '#server/database/migrator.ts'
import root from '#server/facades/router.facade.ts'
import authMiddleware from '#server/router/middlewares/auth.middleware.ts'
import modules from '#server/services/modules.service.ts'
import { basePath } from '#server/utils/paths.ts'

const router = root.use(authMiddleware)
    .prefix('/api/modules')
    .group()

router.get('/', () => {
    return modules.list()
})

router.get('/:id', ({ params }) => {
    return modules.find(params.id)
})

router.post('/:id/toggle', async ({ params, query }) => {
    return modules.toggle(params.id, query)
})

router.post('/:id/migrate', async ({ params }) => {
    return await migrator.migrateByModule(params.id)
})

router.post('/:id/rollback', async ({ params }) => {
    return await migrator.rollbackByModule(params.id)
})

router.get('/:id/migrations', async ({ params }) => {
    const all = await migrator.list()

    const migrations = all
        .filter(m => m.module === params.id)
        .map(m => ({
            name: m.name,
            filename: path.relative(basePath(), m.filePath),
            status: m.executedAt ? 'executed' : 'pending',
        }))

    return migrations
})

