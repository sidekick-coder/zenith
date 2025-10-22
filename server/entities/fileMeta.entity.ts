import { Model } from '#server/mixins/model.mixin.ts'
import BaseMeta from '#shared/entities/fileMeta.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class FileMeta extends composeWith(
    BaseMeta,
    Model('file_metas')
) {

}