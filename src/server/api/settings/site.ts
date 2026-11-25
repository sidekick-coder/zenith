import { config, defineAuthHandler } from '@sidekick-coder/zenith-kit/server'

export default defineAuthHandler(async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'site' })

    return config.get('site', {})
})
