import fs from 'fs'
import { clientPath, env } from '@sidekick-coder/zenith-kit/server'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import router from '#server/facades/router.facade.ts'
import File from '#server/entities/file.entity.ts'

router.get('/favicon', async ({ response }) => {
    const fileId = config.get('site.favicon_image_id', null)
    let defaultIcon = clientPath('public', 'favicon.ico')

    if (env.production) {
        defaultIcon = clientPath('favicon.ico')
    }

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
