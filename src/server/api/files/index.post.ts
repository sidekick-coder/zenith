import mime from 'mime'
import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import { encrypt } from '@sidekick-coder/zenith-kit/server'
import File from '#server/entities/file.entity.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ query }) => {
    const key = validator.validate(query.key, v => v.string())
    const data = encrypt.verifyUrl(key)

    const payload = validator.validate(data, v => v.object({
        filename: v.string(),
        client_name: v.string(),
        drive: v.string(),
        purpose: v.string(),
        public: v.boolean(),
    }))

    const file = await File.create({
        ...payload,
        public: payload.public ? 1 : 0,
        mimetype: mime.getType(payload.filename) || 'application/octet-stream',
    })

    await file.loadUrl()

    return file
})
