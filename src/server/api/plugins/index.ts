import { defineHandler, pluginService  } from '@sidekick-coder/zenith-kit/server'

export default defineHandler(async ({ acl }) => {
    acl.authorize('list', 'Plugin')

    const plugins = await pluginService.repository.findMany() 

    return { items: plugins }
})
