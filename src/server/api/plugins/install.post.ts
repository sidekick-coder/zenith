import * as v from 'valibot'
import { BaseException } from '@sidekick-coder/zenith-kit/shared'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import validator from '#shared/services/validator.service.ts'
import server from '#server/facades/server.facade.ts'
import ShellException from '#server/exceptions/ShellException.ts'
import pluginDownloadService from '#server/facades/pluginDownloadService.ts'

export default async function({ acl, body }: HttpContext) {
    acl.authorize('install', 'Plugin')

    const options = validator.validate(body, v.object({
        repository: v.string(),
        ssh_key: v.optional(v.string()),
        ssh_key_file: v.optional(v.string()),
    }))

    const [error] = await tryCatch(() => pluginDownloadService.download({
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

    setTimeout(() => server.reload(), 2000)

    return { success: true }
}
