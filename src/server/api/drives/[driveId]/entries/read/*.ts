import mime from 'mime'
import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import drive from '#server/facades/drive.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params, response }) => {
    const filename = validator.validate(params['*'], v => v.string())
    const id = validator.validate(params.driveId, v => v.string())
    const current = drive.use(id)
    const entry = await current.find(filename)

    acl.authorize('read', 'DriveEntry', { filename })

    if (entry.type !== 'file') {
        throw new BaseException($t('Entry is not a file'), 400)
    }

    const basename = filename.split('/').pop() || 'file'
    const stream = await current.readStream(filename)

    response.set('Content-Type', mime.getType(basename) || 'application/octet-stream')
    response.set('Content-Disposition', `inline; filename="${basename}"`)
    stream.pipe(response)

    return new Promise<void>((resolve, reject) => {
        stream.on('end', resolve)
        stream.on('error', reject)
    })
})
