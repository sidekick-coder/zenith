import { defineAuthHandler, config } from '@sidekick-coder/zenith-kit/server'
import BaseException from '#server/exceptions/base.ts'
import drive from '#server/facades/drive.facade.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ acl, params }) => {
    const id = validator.validate(params.id, v => v.string())
    const current = drive.use(id)

    if (!current) {
        throw new BaseException($t('Drive not found'), 404)
    }

    acl.authorize('write', 'Config', { key: 'drive.default' })
    config.set('drive.default', id)
})
