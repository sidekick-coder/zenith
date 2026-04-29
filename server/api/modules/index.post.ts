import * as v from 'valibot'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import modules from '#server/facades/modules.facade.ts'
import validator from '#shared/services/validator.service.ts'
import server from '#server/facades/server.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import BaseException from '#server/exceptions/base.ts'
import ShellException from '#server/exceptions/ShellException.ts'

export default async function({ acl, body }: HttpContext) {
    acl.authorize('create', 'Module')

    const options = validator.validate(body, v.object({
        id: v.string(),
        repository: v.string(),
        branch: v.optional(v.string()),
        key: v.optional(v.string()),
    }))

    const [error] = await tryCatch(() => modules.installer.install(options))

    if (error instanceof ShellException) {
        let message = `Failed to install module: ${error.message}`

        if (error.bin) {
            message += `\n\nCommand: ${error.bin} ${error.args.join(' ')}`
        }

        if (error.output) {
            message += `\n\n${error.output}`
        }

        throw new BaseException(message, 422)
    }

    if (error) {
        throw new BaseException(`Failed to install module: ${error.message}`, 422)
    }

    setTimeout(() => server.reload(), 2000)

    return { success: true }
}
