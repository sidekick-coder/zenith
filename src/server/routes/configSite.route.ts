import fs from 'fs'
import { clientPath } from '@sidekick-coder/zenith-kit/server'
import config from '#server/facades/config.facade.ts'
import router from '#server/facades/router.facade.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import File from '#server/entities/file.entity.ts'

const group = router.use(authMiddleware)
    .prefix('/api/configs/site')
    .group()

group.get('/', async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'site' })

    const data = config.get('site', {})

    if (data.favicon_image_id) {
        const file = await File.findOrFail(data.favicon_image_id)
        await file.loadUrl()

        data.favicon_url = file.url
    }

    return data
})

group.many(['PATCH', 'PUT'], '/', async ({ acl, body }) => {
    acl.authorize('update', 'Config', { key: 'site' })

    config.set('site', body)

    return body
})

router.get('/favicon', async ({ response }) => {
    const fileId = config.get('site.favicon_image_id', null)
    const defaultIcon = clientPath('public', 'favicon.ico')

    let contents = null

    if (fileId) {
        const file = await File.findOrFail(fileId)
        response.set('Content-Type', file.mimetype || 'image/x-icon')

        contents = await file.read()
    }

    if (!contents) {
        contents = fs.readFileSync(defaultIcon)
        response.set('Content-Type', 'image/x-icon')
    }

    response.send(contents)
})
