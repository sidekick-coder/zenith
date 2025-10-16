import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/file.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { Metadata } from '#server/mixins/metadata.mixin.ts'

export default class File extends composeWith(
    Base,
    Model('files'),
    Metadata('files_metas', 'file_id')
) {

}