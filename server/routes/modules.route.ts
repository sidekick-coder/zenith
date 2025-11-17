import path from 'path'
import fs from 'fs'
import mime from 'mime'
import migrator from '#server/facades/migrator.facade.ts'
import root from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import modules from '#server/services/modules.service.ts'
import { basePath, tmpPath } from '#server/utils/paths.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import BaseException from '#server/exceptions/base.ts'
import validator from '#shared/services/validator.service.ts'
import server from '#server/facades/server.facade.ts'

const router = root.use(authMiddleware)
    .prefix('/api/modules')
    .group()

router.get('/', ({ acl }) => {
    acl.authorize('read', 'Module')

    return modules.list()
})

router.get('/:id', async ({ params, acl }) => {
    acl.authorize('read', 'Module')

    const mod = await modules.find(params.id)

    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    return mod
})


router.get('/:id/migrations', async ({ params, acl }) => {
    acl.authorize('read', 'Module')

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

router.post('/:id/toggle', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    await modules.toggle(params.id)

    await server.booter.boot()
})

router.post('/:id/migrate', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const items = await migrator.migrateByModule(params.id)

    const itemWithError = items.find(i => i.error)

    if (itemWithError?.error) {
        throw new BaseException(itemWithError.error)
    }

    return { success: true, }
})

router.post('/:id/rollback', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const items = await migrator.rollback({
        module: params.id,
    })

    const itemWithError = items.find(i => i.error)

    if (itemWithError?.error) {
        throw new BaseException(itemWithError.error)
    }

    return { success: true, }
})

router.post('/:id/fresh', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const items = await migrator.fresh({
        module: params.id,
    })

    const itemWithError = items.find(i => i.error)

    if (itemWithError?.error) {
        throw new BaseException(itemWithError.error)
    }

    return items
})

router.post('/:id/install-dependencies', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const mod = await modules.find(params.id)

    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    await modules.installDependencies(params.id)

    return { success: true }
})

router.post('/:id/seed', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const mod = await modules.find(params.id)

    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    await modules.runSeeds(params.id)

    return { success: true }
})

router.post('/:id/build', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const mod = await modules.find(params.id)

    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    await modules.builder.build(params.id)

    return { success: true }
})

router.post('/:id/uninstall', async ({ params, body, acl }) => {
    acl.authorize('delete', 'Module')

    const mod = await modules.find(params.id)

    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    if (mod.enabled) {
        throw new BaseException('Module is enabled, cannot uninstall')
    }

    const options = validator.validate(body, v => v.object({
        rollback: v.optional(v.boolean()),
    }))

    await modules.uninstall(params.id, {
        rollback: options.rollback,
    })

    return { success: true, }
})

router.post('/upgrade/zip', async ({ upload, body, acl }) => {
    acl.authorize('update', 'Module')

    const file = await upload.single('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    validator.validate(file, v => v.object({
        mimetype: v.picklist(['application/zip', 'application/x-zip-compressed', 'multipart/x-zip']),
    }))

    const options = validator.validate(body, v => v.object({
        id: v.string(),
    }))

    const mod = await modules.find(options.id)
    
    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    if (mod.enabled) {
        throw new BaseException('Module is enabled, disable it before upgrading')
    }

    const filename = tmpPath(options.id + '_upgrade_' + Date.now() + '.zip')

    await fs.promises.writeFile(filename, file.buffer)

    const [error] = await tryCatch(() => modules.upgrader.fromZip({
        id: options.id,
        filename,
    }))

    if (error) {
        throw new BaseException(`Failed to upgrade module: ${error.message}`)
    }

    // Clean up temporary file
    fs.unlinkSync(filename)

    return { success: true }
})

router.post('/upgrade/git', async ({ body, acl }) => {
    acl.authorize('update', 'Module')

    const options = validator.validate(body, v => v.object({
        id: v.string(),
        repository: v.string(),
        branch: v.optional(v.string()),
        key: v.optional(v.string()),
    }))

    const mod = await modules.find(options.id)
    
    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    if (mod.enabled) {
        throw new BaseException('Module is enabled, disable it before upgrading')
    }

    const [error] = await tryCatch(() => modules.upgrader.fromGit({
        id: options.id,
        repository: options.repository,
        branch: options.branch,
        key: options.key
    }))

    if (error) {
        throw new BaseException(`Failed to upgrade module: ${error.message}`)
    }

    return { success: true }
})

router.post('/install/zip', async ({ upload, query, acl }) => {
    acl.authorize('create', 'Module')

    const file = await upload.single('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    validator.validate(file, v => v.object({
        mimetype: v.picklist(['application/zip', 'application/x-zip-compressed', 'multipart/x-zip']),
    }))

    const id = query.id as string || path.basename(file.originalname, path.extname(file.originalname))

    const filename = tmpPath(id + '.zip')

    await fs.promises.writeFile(filename, file.buffer)

    const [error] = await tryCatch(() => modules.installer.fromZip({ 
        id,
        filename 
    }))

    if (error) {
        throw new BaseException(`Failed to install module: ${error.message}`)
    }

    await modules.prepare(id)

    return { success: true, }
})

router.post('/install/git', async ({ body, acl }) => {
    acl.authorize('create', 'Module')

    const options = validator.validate(body, v => v.object({
        id: v.string(),
        repository: v.string(),
        branch: v.optional(v.string()),
        key: v.optional(v.string()),
    }))

    const [error] = await tryCatch(() => modules.installer.fromGit(options))

    if (error) {
        throw new BaseException(`Failed to install module: ${error.message}`)
    }

    await modules.prepare(options.id)

    return { success: true, }
})

root.get('/static/modules/:id/:context/*', async ({ params, response }) => {
    const moduleId = params.id
    const context = validator.validate(params.context, v => v.picklist(['client', 'shared', 'dist']))
    const assetPath = validator.validate(params['*'], v => v.string())
    const basename = path.basename(assetPath)
    
    const mod = await modules.find(moduleId)
    
    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    const fullPath = mod.makePath(context, assetPath)

    if (!fs.existsSync(fullPath)) {
        throw new BaseException('Asset not found', 404)
    }
    
    const stats = fs.statSync(fullPath)
    
    if (!stats.isFile()) {
        throw new BaseException('Not a file', 400)
    }
    
    const mimetype = mime.getType(basename) || 'application/octet-stream'
    const data = fs.readFileSync(fullPath)
    
    response.set('Content-Type', mimetype)
    response.set('Content-Disposition', `inline; filename="${basename}"`)
    response.send(data)
})

