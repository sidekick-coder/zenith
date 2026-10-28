import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import PluginMarketplaceService from '#server/services/pluginMarketplace.service.ts'

export default async function({ acl, params }: HttpContext) {
    acl.authorize('list', 'Plugin')

    const pluginId = validator.validate(params.pluginId, v => v.string())
    const item = await PluginMarketplaceService.create().find(pluginId)

    if (!item) {
        throw new BaseException('Marketplace plugin not found', 404)
    }

    return item
}
