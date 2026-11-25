import { defineAuthHandler, config } from '@sidekick-coder/zenith-kit/server'

export default defineAuthHandler(async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'oauth' })

    return config.get('oauth', {})
})
