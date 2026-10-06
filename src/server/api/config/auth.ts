import { defineHandler, config } from '@sidekick-coder/zenith-kit/server'

export default defineHandler(async ({ acl }) => {
    acl.authorize('read', 'Config', { key: 'auth' })

    return config.get('auth', {})
})
