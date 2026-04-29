import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import modules from '#server/facades/modules.facade.ts'
import server from '#server/facades/server.facade.ts'

export default async function({ params, acl }: HttpContext) {
    acl.authorize('update', 'Module')

    const id = validator.validate(params.moduleId, v => v.string())

    await modules.toggle(id)

    setTimeout(() => server.reload(), 1000)

    return { success: true }
}
