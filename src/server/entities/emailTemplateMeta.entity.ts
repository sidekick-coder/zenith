import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model } from '#server/mixins/model.mixin.ts'
import BaseMeta from '#shared/entities/emailTemplateMeta.entity.ts'

export default class EmailTemplateMeta extends composeWith(
    BaseMeta,
    Model('email_template_metas')
) {

}
