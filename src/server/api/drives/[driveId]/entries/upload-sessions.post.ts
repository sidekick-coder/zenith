import { join } from 'path'
import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import FileUploadSession from '#server/entities/fileUploadSession.entity.ts'
import drive from '#server/facades/drive.facade.ts'
import normalizers from '#server/normalizers/index.ts'
import validator from '#shared/services/validator.service.ts'
import { cuid } from '#server/utils/cuid.util.ts'

export default defineAuthHandler(async ({ acl, params, body }) => {
    const payload = validator.validate(body, v => v.object({
        client_name: v.pipe(v.string(), v.minLength(1)),
        folder: v.optional(v.string()),
        mime_types: v.optional(v.string(), '*/*'),
        max_size: v.optional(v.number(), 50 * 1024 * 1024),
    }))
    const id = validator.validate(params.driveId, v => v.string())
    const current = drive.use(id)

    acl.authorize('create', 'DriveEntry', { filename: payload.client_name })

    const ext = payload.client_name.split('.').pop() || ''
    let filename = cuid() + (ext ? `.${ext}` : '')

    if (payload.folder) {
        filename = join(payload.folder.replace(/^\//, ''), filename)
    }

    const expireAt = Date.now() + 15 * 60 * 1000
    const session = await FileUploadSession.create({
        purpose: 'drive-entry',
        mime_types: payload.mime_types,
        max_size: payload.max_size,
        expires_at: normalizers.datetime.toDb(new Date(expireAt))!,
    })

    session.upload_url = await current.uploadUrl(filename, {
        expires: '15m',
        mime_types: payload.mime_types,
        max_size: payload.max_size,
    })

    return session
})
