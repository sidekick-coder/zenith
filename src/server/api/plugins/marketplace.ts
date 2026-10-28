import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import PluginMarketplaceService from '#server/services/pluginMarketplace.service.ts'

export default async function({ acl }: HttpContext) {
    acl.authorize('list', 'Plugin')

    const items = await PluginMarketplaceService.create().list()

    return { items }
}
