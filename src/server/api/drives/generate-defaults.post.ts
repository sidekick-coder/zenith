import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { drive } from '@sidekick-coder/zenith-kit/server'

export default defineAuthHandler(async ({ acl }) => {
    acl.authorize('create', 'Drive')

    await drive.createDefaultDrives()

    return { message: 'Default drives created' }
})
