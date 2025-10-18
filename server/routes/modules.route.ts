import path from 'path'
import fs from 'fs'
import migrator from '#server/facades/migrator.facade.ts'
import root from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import modules from '#server/services/modules.service.ts'
import { basePath, tmpPath } from '#server/utils/paths.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import BaseException from '#server/exceptions/base.ts'
import build from '#server/services/build.service.ts'
import validator from '#shared/services/validator.service.ts'

const router = root.use(authMiddleware)
    .prefix('/api/modules')
    .group()

router.get('/', () => {
    return modules.list()
})

router.get('/:id', ({ params }) => {
    return modules.find(params.id)
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

router.post('/:id/toggle', async ({ params }) => {
    await modules.toggle(params.id)

    await build.build()

    await build.reloadServer()
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
    const items = await migrator.rollback({
        module: params.id,
    })

    const itemWithError = items.find(i => i.error)

    if (itemWithError?.error) {
        throw new BaseException(itemWithError.error)
    }

    return { success: true, }
})

router.post('/:id/fresh', async ({ params }) => {
    const items = await migrator.fresh({
        module: params.id,
    })

    const itemWithError = items.find(i => i.error)

    if (itemWithError?.error) {
        throw new BaseException(itemWithError.error)
    }

    return items
})

router.post('/:id/uninstall', async ({ params, body }) => {
    const options = validator.validate(body, v => v.object({
        rollback: v.optional(v.boolean()),
    }))

    await modules.uninstall(params.id, {
        rollback: options.rollback,
    })

    return { success: true, }
})

router.post('/install/zip', async ({ upload, query }) => {
    const file = await upload.single('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    validator.validate(file, v => v.object({
        mimetype: v.picklist(['application/zip', 'application/x-zip-compressed', 'multipart/x-zip']),
    }))

    const modulesPath = path.join(basePath(), 'modules')
    
    // Ensure modules directory exists
    if (!fs.existsSync(modulesPath)) {
        fs.mkdirSync(modulesPath, { recursive: true })
    }

    const id = query.id || path.basename(file.originalname, path.extname(file.originalname))

    const filename = tmpPath(id + '.zip')

    await fs.promises.writeFile(filename, file.buffer)

    const [error] = await tryCatch(() => modules.installFromZip(filename, id))

    if (error) {
        throw new BaseException(`Failed to install module: ${error.message}`)
    }

    return { success: true, }
})

