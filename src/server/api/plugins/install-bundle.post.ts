import fs from 'fs'
import * as v from 'valibot'
import { BaseException, createId } from '@sidekick-coder/zenith-kit/shared'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { tmpPath } from '@sidekick-coder/zenith-kit/server'
import type { HttpContext } from '#server/contracts/httpContext.contract.ts'
import validator from '#shared/services/validator.service.ts'
import server from '#server/facades/server.facade.ts'
import ShellException from '#server/exceptions/ShellException.ts'
import pluginDownloadService from '#server/facades/pluginDownloadService.ts'

function streamToFile(stream: NodeJS.ReadableStream, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath)

        stream.pipe(writeStream)

        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
    })
}

export default async function({ acl, query, request }: HttpContext) {
    acl.authorize('install', 'Plugin')

    const id = createId()
    const filename = tmpPath(`plugin-bundle-${id}.bundle`)

    await streamToFile(request, filename)

    const branch = validator.validate(query.branch, v.string())

    const [error] = await tryCatch(() => pluginDownloadService.download({
        repository: filename,
        branch: branch,
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
