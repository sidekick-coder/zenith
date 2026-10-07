import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { translatorSchema } from '#shared/schemas/translatorSchema.ts'

export default defineHandler(async ({ acl, body }) => {
    acl.authorize('update', 'Config', { key: 'translator' })

    const payload = validator.validate(body, translatorSchema.update)

    const data: any = {
        ...config.get('translator', {}),
        ...payload
    }

    config.set('translator', data)

    return data
})
