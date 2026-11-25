import mime from 'mime'
import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import { drive } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import encrypt from '#server/facades/encrypt.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineHandler(async ({ params, query, request }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const id = validator.validate(params.id, v => v.string())
    const current = drive.use(id)
    const key = validator.validate(query.key, v => v.optional(v.string()))
    const size = request.headers['content-length']
        ? Number(request.headers['content-length'])
        : null

    if (!key) {
        throw new BaseException('Upload key is required', 400)
    }

    if (!size || size <= 0) {
        throw new BaseException('Content-Length header is required for upload', 400)
    }

    const data = encrypt.verifyUrl(key)

    current.validateUpload(data, {
        mimetype: mime.getType(filename) || 'application/octet-stream',
        size,
    })

    await current.writeStream(filename, request)

    return { success: true }
})
