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
    Metadata('file_metas', 'file_id')
) {
    public static boot(){
        this.on('serialized', async (file: File) => {
            file.url = await drive.url(file.filename)
        })
    }

    public static async has(filename: string): Promise<boolean> {
        const exists = await this.exists({
            query: q => q.where('filename', '=', filename)
        })

        return exists
    }

    public static async findByFilename(filename: string) {
        return await this.findOne({
            where: qb => qb('filename', '=', filename)
        })
    }

    public readStream() {
        return drive.use(this.drive).readStream(this.filename)
    }

    public async loadUrl() {
        this.url = await drive.use(this.drive).url(this.filename)
    }
}