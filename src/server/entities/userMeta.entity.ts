import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model } from '#server/mixins/model.mixin.ts'
import BaseMeta from '#shared/entities/userMeta.entity.ts'

export default class UserMeta extends composeWith(
    BaseMeta,
    Model('user_metas')
) {

}
