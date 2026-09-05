// import mjml from 'mjml'
import { createRequire } from 'module'
import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import config from '@sidekick-coder/zenith-kit/server/facades/config'
import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/emailTemplate.entity.ts'
import { Metadata } from '#server/mixins/metadata.mixin.ts'
import { HooksStatic } from '#server/mixins/hooks.mixin.ts'
import HasMetas from '#server/relations/hasMetas.relation.ts'
import { Relation } from '#server/mixins/relations.mixin.ts'
import env from '#server/facades/env.facade.ts'

const require = createRequire(import.meta.url)

const EmailTemplateRelations = {
    metas: new HasMetas({
        table: 'email_templates',
        tableKey: 'id',

        targetTable: 'email_template_metas',
        targetKey: 'template_id',

        property: 'metas',
    })
}

export default class EmailTemplate extends composeWith(
    Base,
    HooksStatic,
    Model('email_templates'),
    Relation(EmailTemplateRelations),
    Metadata('email_template_metas', 'template_id')
) {

    public static compile(payload: string, context: Record<string, any> = {}): string {
        const finalContext = {
            ...context,
            site: {
                name: config.get('site.name', 'Zenith'),
                support_email: config.get('site.support_email', '-'),
                url: env.get('APP_URL', 'http://localhost:3000'),
            },
        }
    
        return super.compile.call(this, payload, finalContext)
    }

    public render(context: Record<string, any> = {}): { subject: string; html: string } {
        const subject = EmailTemplate.compile(this.subject, context)
        let html = EmailTemplate.compile(this.body || '', context)

        if (this.engine === 'mjml') {
            const mjml = require('mjml')

            html = mjml(html, {}).html
        }

        return { 
            subject,
            html
        }
    }

}
