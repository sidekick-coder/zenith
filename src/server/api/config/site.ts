import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'
import File from '#server/entities/file.entity.ts'

export default defineHandler(async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'site' })

    const data = config.get('site', {})

    if (data.favicon_image_id) {
        const file = await File.findOrFail(data.favicon_image_id)

        await file.loadUrl()

        data.favicon_url = file.url
    }

    return data
})
