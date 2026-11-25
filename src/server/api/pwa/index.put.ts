import { config, defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineAuthHandler(async ({ body, acl }) => {
    acl.authorize('update', 'Config', { key: 'pwa' })

    const payload = validator.validate(body, schemas.pwa.update)

    config.set('pwa', payload)

    return config.get('pwa', {})
})
