import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model } from '#server/mixins/model.mixin.ts'
import BaseMeta from '#shared/entities/fileMeta.entity.ts'

export default class FileMeta extends composeWith(
    BaseMeta,
    Model('file_metas')
) {

}
