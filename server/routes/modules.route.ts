import path from 'path'
import migrator from '#server/database/migrator.ts'
import root from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import modules from '#server/services/modules.service.ts'
import { basePath } from '#server/utils/paths.ts'
import env from '#server/env.ts'
import BaseException from '#server/exceptions/base.ts'

const router = root.use(authMiddleware)
    .prefix('/api/modules')
    .group()

router.get('/', () => {
    return modules.list()
})

router.get('/:id', ({ params }) => {
    return modules.find(params.id)
})

router.post('/:id/toggle', async ({ params }) => {
    return modules.toggle(params.id, {
        build: env.isProduction,
        boot: true
    })
})

router.post('/:id/migrate', async ({ params }) => {
    const items = await migrator.migrateByModule(params.id)

    const itemWithError = items.find(i => i.error)

    if (itemWithError?.error) {
        throw new BaseException(itemWithError.error)
    }

    return { success: true, }
})

router.post('/:id/rollback', async ({ params }) => {
    const items = await migrator.rollbackByModule(params.id)

    const itemWithError = items.find(i => i.error)

    if (itemWithError?.error) {
        throw new BaseException(itemWithError.error)
    }

    return { success: true, }
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

