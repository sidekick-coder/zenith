import { Model } from '#server/mixins/model.mixin.ts'
import BaseMeta from '#shared/entities/emailTemplateMeta.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class EmailTemplateMeta extends composeWith(
    BaseMeta,
    Model('email_template_metas')
) {

}
