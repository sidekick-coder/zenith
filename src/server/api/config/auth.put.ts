import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { authSchema } from '#shared/schemas/authSchema.ts'
import server from '#server/facades/server.facade.ts'

export default defineHandler(async ({ acl, body }) => {
    acl.authorize('update', 'Config', { key: 'auth' })

    const payload = validator.validate(body, authSchema.update)

    const needToReset = config.get('auth.disabled') !== payload.disabled

    const auth: any = {
        ...config.get('auth', {}),
        ...payload
    }

    config.set('auth', auth)

    if (needToReset) {
        setTimeout(() => server.reload(), 1000)
    }

    return auth
})
