import { promises as fs } from 'fs'
import { join } from 'path'
import mime from 'mime'
import type DriveContract from '#server/contracts/drive.contract.ts'
import FileEntity from '#server/entities/file.entity.ts'

export default class FsDrive implements DriveContract {
    private basePath: string

    constructor(basePath: string = './storage/files') {
        this.basePath = basePath
    }

    async list(folder?: string): Promise<FileEntity[]> {
        const filepath = folder ? join(this.basePath, folder) : this.basePath

        const files = await fs.readdir(filepath)

        const entities: FileEntity[] = []

        for (const filename of files) {
            const filePath = join(filepath, filename)

            const stats = await fs.stat(filePath)
            
            if (stats.isFile()) {                
                const file = new FileEntity({
                    filename,
                    mimetype: mime.getType(filename) || 'application/octet-stream'
                })

                entities.push(file)
            }
        }

        return entities
    }

    async find(filename: string): Promise<FileEntity> {
        const filePath = join(this.basePath, filename)
        
        const stats = await fs.stat(filePath)

        if (!stats.isFile()) {
            throw new Error(`File not found: ${filename}`)
        }

        return new FileEntity({
            filename,
            mimetype: mime.getType(filename) || 'application/octet-stream'
        })
    }

    async read(filename: string): Promise<Uint8Array> {
        const filePath = join(this.basePath, filename)
        
        const buffer = await fs.readFile(filePath)
        
        return new Uint8Array(buffer)
    }

    async write(filename: string, data: Uint8Array): Promise<void> {
        await fs.mkdir(this.basePath, { recursive: true })
        
        const filePath = join(this.basePath, filename)

        await fs.writeFile(filePath, data)
    }

    async delete(filename: string): Promise<void> {
        const filePath = join(this.basePath, filename)
        
        await fs.unlink(filePath)
    }
}