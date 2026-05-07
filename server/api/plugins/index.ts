import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import pluginManager from '#server/facades/pluginManager.ts'

export default function ({ acl }: HttpContext) {
    acl.authorize('list', 'Plugin')

    const plugins = pluginManager.list() 

    return { items: plugins }
}
