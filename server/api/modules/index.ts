import type { HttpContext } from '@sidekick-coder/zenith-kit/server'
import modules from '#server/facades/modules.facade.ts'

export default function ({ acl }: HttpContext) {
    acl.authorize('list', 'Module')

    return modules.list()
}
