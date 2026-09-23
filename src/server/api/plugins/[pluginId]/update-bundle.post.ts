import fs from 'fs'
import { BaseException, createId } from '@sidekick-coder/zenith-kit/shared'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { tmpPath } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'

import validator from '#shared/services/validator.service.ts'
import ShellException from '#server/exceptions/ShellException.ts'
import pluginManager from '#server/facades/pluginManager.ts'

function streamToFile(stream: NodeJS.ReadableStream, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath)

        stream.pipe(writeStream)

        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
    })
}

export default async function({ acl, request, params }: HttpContext) {
    acl.authorize('update', 'Plugin')

    const pluginId = validator.validate(params.pluginId, v => v.string())
    const id = createId()
    const filename = tmpPath(`plugin-bundle-${id}.bundle`)

    await streamToFile(request, filename)

    const plugin = pluginManager.findOrFail(pluginId)

    const [error] = await tryCatch(() => pluginManager.updater.bundle(plugin, { filename: filename }))

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
