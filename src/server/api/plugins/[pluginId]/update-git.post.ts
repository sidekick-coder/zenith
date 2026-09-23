import * as v from 'valibot'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'

import validator from '#shared/services/validator.service.ts'
import ShellException from '#server/exceptions/ShellException.ts'
import pluginManager from '#server/facades/pluginManager.ts'

export default async function({ acl, params, body }: HttpContext) {
    acl.authorize('update', 'Plugin')

    const pluginId = validator.validate(params.pluginId, v => v.string())

    const options = validator.validate(body, v.object({
        repository: v.string(),
        ssh_key: v.optional(v.string()),
        ssh_key_file: v.optional(v.string()),
    }))

    const plugin = pluginManager.findOrFail(pluginId)

    const [error] = await tryCatch(() => pluginManager.updater.remote(plugin, {
        repository: options.repository,
        sshKey: options.ssh_key,
        sshKeyFile: options.ssh_key_file
    }))

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
        throw error
    }

    return { success: true }
}
