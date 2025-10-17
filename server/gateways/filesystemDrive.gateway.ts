import fs from 'fs'
import path, { join, relative } from 'path'
import mime from 'mime'
import ms from 'ms'
import type DriveContract from '#server/contracts/drive.contract.ts'
import DriveEntity from '#shared/entities/driveEntry.entity.ts'
import encrypt from '#server/facades/encrypt.facade.ts'

interface Payload {
    name: string;
    description?: string;
    path: string;
}

export default class FilesystemDrive implements DriveContract {
    public id: string
    public name: string
    public description?: string
    public path: string
    public metas = {}

    constructor(id: string, payload: Payload) {
        this.id = id
        this.path = payload.path
        this.name = payload.name
        this.description = payload.description
    }

    public absolutePath(...args: string[]) {
        return join(this.path, ...args)
    }

    public async exists(filename: string): Promise<boolean> {
        return fs.promises.access(join(this.path, filename))
            .then(() => true)
            .catch(() => false)
    }

    async list(folder?: string): Promise<DriveEntity[]> {
        const filepath = folder ? join(this.path, folder) : this.path

        const files = await fs.promises.readdir(filepath)

        const entries: DriveEntity[] = []

        for (const filename of files) {
            const filePath = join(filepath, filename)

            const stats = await fs.promises.stat(filePath)

            const metas: any = {}

            if (stats.isFile()) {
                metas.size = stats.size
                metas.mimetype = mime.getType(filename) || 'application/octet-stream'
            }
            
            const entry = new DriveEntity({
                name: filename,
                path: '/' + relative(this.path, filePath),
                type: stats.isDirectory() ? 'directory' : 'file',
                metas
            })

            entries.push(entry)
        }

        return entries
    }

    async find(filename: string): Promise<DriveEntity> {
        const entries = await this.list(path.dirname(filename))

        const entry = entries.find(e => e.path === filename)

        if (!entry) {
            throw new Error(`File "${filename}" not found`)
        }

        return entry
    }

    async mkdir(filename: string): Promise<void> {
        const dirPath = join(this.path, filename)

        console.log(dirPath)

        await fs.promises.mkdir(dirPath, { recursive: true })
    }

    async read(filename: string): Promise<Uint8Array> {
        const filePath = join(this.path, filename)
        
        const buffer = await fs.promises.readFile(filePath)
        
        return new Uint8Array(buffer)
    }

    public readStream(filename: string) {
        const filePath = join(this.path, filename)
        
        const stream = fs.createReadStream(filePath)
        
        return Promise.resolve(stream)
    }

    async write(filename: string, data: Uint8Array): Promise<void> {
        const filePath = join(this.path, filename)
        const folder = path.dirname(filePath)

        await fs.promises.mkdir(folder, { recursive: true })

        await fs.promises.writeFile(filePath, data)
    }

    async delete(filename: string): Promise<void> {
        const filePath = join(this.path, filename)

        await fs.promises.unlink(filePath)
    }

    public url: DriveContract['url'] = async (filename, options) => {
        const expires = ms(options?.expires || '30m') // milliseconds
        
        const expireAt = Date.now() + expires

        const data = {
            filename: `/${filename}`,
            expireAt
        }

        const key = encrypt.encrypt(JSON.stringify(data))
        const basename = path.basename(filename)
        const params = new URLSearchParams()

        params.append('filename', encodeURIComponent(data.filename))
        params.append('key', encodeURIComponent(key))

        return `/api/drives/${this.id}/stream/${basename}?${params.toString()}`
    }
}