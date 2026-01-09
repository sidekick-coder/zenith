import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/emailTemplate.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { Metadata } from '#server/mixins/metadata.mixin.ts'
import { HooksStatic } from '#server/mixins/hooks.mixin.ts'
import HasMetas from '#server/relations/hasMetas.relation.ts'
import { Relation } from '#server/mixins/relations.mixin.ts'

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

}
