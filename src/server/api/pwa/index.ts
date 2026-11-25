import { config, defineAuthHandler } from '@sidekick-coder/zenith-kit/server'

export default defineAuthHandler(async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'pwa' })

    return config.get('pwa', {})
})
