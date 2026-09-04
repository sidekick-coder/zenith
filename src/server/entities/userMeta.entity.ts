import { Model } from '#server/mixins/model.mixin.ts'
import BaseMeta from '#shared/entities/userMeta.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class UserMeta extends composeWith(
    BaseMeta,
    Model('user_metas')
) {

}