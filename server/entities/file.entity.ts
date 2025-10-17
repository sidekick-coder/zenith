import { Model } from '#server/mixins/model.mixin.ts'
import Base from '#shared/entities/file.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { Metadata } from '#server/mixins/metadata.mixin.ts'
import drive from '#server/facades/drive.facade.ts'
import { Hooks } from '#server/mixins/hooks.mixin.ts'

export default class File extends composeWith(
    Base,
    Hooks,
    Model('files'),
    Metadata('files_metas', 'file_id')
) {
    public static boot(){
        this.on('serialized', async (file: File) => {
            file.url = await drive.url(file.filename)
        })
    }
}