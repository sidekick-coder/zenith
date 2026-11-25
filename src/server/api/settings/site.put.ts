import { config, defineAuthHandler } from '@sidekick-coder/zenith-kit/server'

export default defineAuthHandler(async ({ acl, body }) => {
    acl.authorize('update', 'Config', { key: 'site' })

    config.set('site', body)

    return body
})
