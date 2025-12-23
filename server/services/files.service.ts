import sharp from 'sharp'
import File from '#server/entities/file.entity.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'
import drive from '#server/facades/drive.facade.ts'

export default class FileService {
    async extract(fileId: File['id']) {
        const file = await File.findOrFail(fileId)
        const buffer = await drive.use(file.drive).read(file.filename)

        const result: Record<string, any> = {}

        const metadata = await sharp(buffer).rotate()
            .metadata()

        const data: Pick<FileMeta, 'name' | 'file_id' | 'value'>[] = []

        if (metadata.width) {
            result.width = metadata.width

            data.push({
                name: 'width',
                file_id: file.id,
                value: `number:${metadata.width}`,
            })
        }

        if (metadata.height) {
            result.height = metadata.height

            data.push({
                name: 'height',
                file_id: file.id,
                value: `number:${metadata.height}`,
            })
        }

        if (metadata.format) {
            result.format = metadata.format

            data.push({
                name: 'format',
                file_id: file.id,
                value: `string:${metadata.format}`,
            })
        }

        if (metadata.size) {
            result.size = metadata.size

            data.push({
                name: 'size',
                file_id: file.id,
                value: `number:${metadata.size}`,
            })
        }        

        if (metadata.space) {
            result.space = metadata.space

            data.push({
                name: 'space',
                file_id: file.id,
                value: `string:${metadata.space}`,
            })
        }

        if (metadata.density) {
            result.density = metadata.density

            data.push({
                name: 'density',
                file_id: file.id,
                value: `number:${metadata.density}`,
            })
        }

        const metas: FileMeta[] = []

        for (const item of data) {
            const result = await FileMeta.updateOrCreate({
                where: eb => eb.and({
                    file_id: item.file_id,
                    name: item.name,
                }),
                values: item,
            })

            metas.push(result)
        }

        return {
            metas: result,
            fileMetas: metas,
        }
    }
}