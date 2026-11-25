import { defineHandler } from '@sidekick-coder/zenith-kit/server'
import File from '#server/entities/file.entity.ts'
import BaseException from '#server/exceptions/base.ts'
import validator from '#shared/services/validator.service.ts'
import schemas from '#shared/validators/index.ts'

export default defineHandler(async ({ params, acl, response }) => {
    const id = validator.validate(params.id, schemas.query.number)
    const file = await File.findOneOrFail({ query: qb => qb.selectAll().where('id', '=', id), })

    if (!file) {
        throw new BaseException('File not found', 404)
    }

    if (!file.public) {
        acl.authorize('read', file)
    }

    const stream = await file.readStream()

    response.set('Content-Type', file.mimetype || 'application/octet-stream')
    response.set('Content-Disposition', `inline; filename="${file.client_name}"`)

    stream.pipe(response)

    stream.on('error', (streamErr) => {
        console.error(`Error streaming file: ${streamErr}`)
        response.status(500).send('Error streaming file')
    })

    return new Promise<void>((resolve, reject) => {
        stream.on('error', reject)
        stream.on('end', resolve)
    })
})
