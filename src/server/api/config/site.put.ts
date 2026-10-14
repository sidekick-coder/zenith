import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import siteSchema from '#shared/schemas/siteSchema.ts'

export default defineHandler(async ({ acl, body }) => {
    acl.authorize('update', 'Config', { key: 'site' })

    const payload = validator.validate(body, siteSchema)

    config.set('site', payload)

    return payload
})
