import mime from 'mime'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { drive } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineHandler(async ({ acl, params, query, response }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const id = validator.validate(params.id, v => v.string())
    const current = drive.use(id)
    const key = validator.validate(query.key, v => v.optional(v.string()))

    if (key) {
        encrypt.verifyUrl(key)
    } else {
        acl.authorize('read', 'DriveEntry', { filename })
    }

    const [error, entry] = await tryCatch(() => current.find(filename))

    if (error || entry.type !== 'file') {
        throw new BaseException('File not found', 404)
    }

    const basename = filename.split('/').pop() || 'file'
    const stream = await current.readStream(filename)

    response.set('Content-Type', mime.getType(basename) || 'application/octet-stream')
    response.set('Content-Disposition', `inline; filename="${basename}"`)
    stream.pipe(response)

    return new Promise<void>((resolve, reject) => {
        stream.on('error', reject)
        stream.on('end', resolve)
    })
})
