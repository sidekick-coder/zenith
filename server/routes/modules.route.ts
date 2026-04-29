import path from 'path'
import fs from 'fs'
import mime from 'mime'
import migrator from '#server/facades/migrator.facade.ts'
import root from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import modules from '#server/facades/modules.facade.ts'
import { tmpPath } from '#server/utils/paths.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import BaseException from '#server/exceptions/base.ts'
import validator from '#shared/services/validator.service.ts'
import server from '#server/facades/server.facade.ts'
import seeder from '#server/facades/seeder.facade.ts'

const router = root.use(authMiddleware)
    .prefix('/api/modules')
    .group()

router.post('/:id/install-dependencies', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const mod = await modules.find(params.id)

    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    await mod.command('npm', ['install'])

    return { success: true }
})

router.post('/:id/seed', async ({ params, acl }) => {
    acl.authorize('update', 'Module')

    const mod = await modules.find(params.id)

    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    await seeder.run({ module: params.id, })

    return { success: true }
})

router.post('/:id/build', async ({ params, acl }) => {
    
    const mod = await modules.findOrFail(params.id)
    
    acl.authorize('build', mod)

    await modules.builder.build(mod)

    return { success: true }
})

router.post('/:id/uninstall', async ({ params, body, acl }) => {
    const mod = await modules.findOrFail(params.id)
    
    acl.authorize('uninstall', mod)

    if (mod.enabled) {
        throw new BaseException('Module is enabled, cannot uninstall')
    }

    if (body.rollback_migrations) {
        await migrator.rollback({ module: params.id, })
    }

    await modules.uninstall(params.id)

    setTimeout(() => server.reload(), 2000)

    return { success: true, }
})

router.post('/upgrade/zip', async ({ upload, body, acl }) => {
    acl.authorize('update', 'Module')

    const file = await upload.single('file')

    if (!file) {
        throw new BaseException('No file provided')
    }

    validator.validate(file, v => v.object({ mimetype: v.picklist(['application/zip', 'application/x-zip-compressed', 'multipart/x-zip']), }))

    const options = validator.validate(body, v => v.object({ id: v.string(), }))

    const mod = await modules.find(options.id)
    
    if (!mod) {
        throw new BaseException('Module not found', 404)
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

    server.reload()

    return { success: true }
})

root.get('/static/modules/:id/:context/*', async ({ params, response }) => {
    const moduleId = params.id
    const context = validator.validate(params.context, v => v.picklist([
        'browser',
    ]))
    
    const assetPath = validator.validate(params['*'], v => v.string())
    const basename = path.basename(assetPath)
    
    const mod = await modules.find(moduleId)
    
    if (!mod) {
        throw new BaseException('Module not found', 404)
    }

    let fullPath = null

    if (context === 'browser') {
        fullPath = mod.makePath('client-dist', 'browser', assetPath)
    }

    if (!fullPath) {
        throw new BaseException('Invalid context', 400)
    }

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

