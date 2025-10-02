import fs from 'fs'
import path, { join, relative } from 'path'
import mime from 'mime'
import type DriveContract from '#server/contracts/drive.contract.ts'
import DriveEntity from '#shared/entities/driveEntry.entity.ts'
import type DriveEntry from '#shared/entities/driveEntry.entity.ts'

export default class FilesystemDrive implements DriveContract {
    private basePath: string
    public metas = {}

    constructor(basePath: string = './storage/files') {
        this.basePath = basePath

        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath)
        }
    }

    public absolutePath(...args: string[]) {
        return join(this.basePath, ...args)
    }

    public async exists(filename: string): Promise<boolean> {
        return fs.promises.access(join(this.basePath, filename))
            .then(() => true)
            .catch(() => false)
    }

    async list(folder?: string): Promise<DriveEntity[]> {
        const filepath = folder ? join(this.basePath, folder) : this.basePath

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
                path: '/' + relative(this.basePath, filePath),
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
        const dirPath = join(this.basePath, filename)

        console.log(dirPath)

        await fs.promises.mkdir(dirPath, { recursive: true })
    }

    async read(filename: string): Promise<Uint8Array> {
        const filePath = join(this.basePath, filename)
        
        const buffer = await fs.promises.readFile(filePath)
        
        return new Uint8Array(buffer)
    }

    async write(filename: string, data: Uint8Array): Promise<void> {
        const filePath = join(this.basePath, filename)
        const folder = path.dirname(filePath)

        await fs.promises.mkdir(folder, { recursive: true })

        await fs.promises.writeFile(filePath, data)
    }

    async delete(filename: string): Promise<void> {
        const filePath = join(this.basePath, filename)

        await fs.promises.unlink(filePath)
    }

    async url(_entry: DriveEntry): Promise<string | undefined> {
        return undefined
    }
}