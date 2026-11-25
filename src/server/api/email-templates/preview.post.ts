import mjml from 'mjml'
import { defineAuthHandler } from '@sidekick-coder/zenith-kit/server'
import EmailTemplate from '#server/entities/emailTemplate.entity.ts'
import validator from '#shared/services/validator.service.ts'

export default defineAuthHandler(async ({ body, acl, response }) => {
    acl.authorize('create', 'EmailTemplate')

    const payload = validator.validate(body, v => v.object({
        engine: v.nullish(v.picklist(['raw', 'html', 'mjml'])),
        subject: v.pipe(v.string(), v.minLength(1)),
        body: v.nullish(v.string()),
        context: v.nullish(v.any()),
    }))

    let context = payload.context || {}

    if (typeof context === 'string') {
        context = JSON.parse(context)
    }

    let result = EmailTemplate.compile(payload.body || '', context)

    if (payload.engine === 'mjml') {
        result = mjml(result, {}).html
    }

    if (['html', 'mjml'].includes(payload.engine || '')) {
        response.setHeader('Content-Type', 'text/html')
    } else {
        response.setHeader('Content-Type', 'text/plain')
    }

    return result
})
