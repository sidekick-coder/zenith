import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { brandingSchema } from '#shared/schemas/brandingSchema.ts'

export default defineHandler(async ({ acl, body }) => {
    acl.authorize('update', 'Config', { key: 'brading' })

    const payload = validator.validate(body, brandingSchema.update)

    config.set('branding', payload)

    return payload
})
