import { randomUUID } from 'crypto'
import mime from 'mime'
import { undeleted } from '#server/queries/index.ts'
import drive from '#server/facades/drive.facade.ts'
import File from '#server/entities/file.entity.ts'
import DriveEntry from '#shared/entities/driveEntry.entity.ts'

interface CreatePayload {
    file: Express.Multer.File
    drive?: string
    metadata?: Record<string, any>
}

export default class FileService {

    public async url(payload: File | File['id']) {

        let file: File | undefined

        if (typeof payload === 'number') {
            file = await File.findOrFail({
                query: qb => qb.selectAll()
                    .where('id', '=', payload)
                    .where(undeleted),
            })
        } 

        if (payload instanceof File) {
            file = payload
        }

        if (!file) {
            return undefined
        }

        return drive.use(file.drive).url(file.filename, { expires: '1h' })
    }

    public async create(options: CreatePayload) {
        const file = options.file
        
        let current = drive
        
        if (options.drive) {
            current = drive.use(options.drive)
        }
        
        const mimetype = mime.getType(file.originalname)
        const ext = mime.getExtension(mimetype || '') || file.originalname.split('.').pop()
        const filename = randomUUID() + (ext ? `.${ext}` : '')
        
        await current.write(filename, file.buffer)
        
        const entity = await File.create({
            client_name: file.originalname,
            drive: current.selected!,
            mimetype: mimetype || file.mimetype,
            metadata: options.metadata ? JSON.stringify(options.metadata) : null,
            filename: filename,
        })
        
        return entity
    }

}