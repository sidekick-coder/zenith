import fs from 'fs'
import { randomUUID } from 'crypto'
import mime from 'mime'
import { undeleted } from '#server/queries/index.ts'
import type DriveContract from '#server/contracts/drive.contract.ts'
import DriveEntry from '#shared/entities/driveEntry.entity.ts'
import BaseException from '#server/exceptions/base.ts'
import config from '#server/facades/config.facade.ts'
import FilesystemDrive from '#modules/callory-tracker/root/server/gateways/filesystemDrive.gateway.ts'
import File from '#server/entities/file.entity.ts'
import type { DriveUrlOptions } from '#server/contracts/drive.contract.ts'
import { storagePath } from '#server/utils/paths.ts'

interface CreatePayload {
    file: Express.Multer.File
    drive?: string
    metadata?: Record<string, any>
}

export default class DriveService {
    private drives: Map<string, DriveContract> = new Map()
    public selected?: string

    public get current() {
        if (!this.selected) return undefined 
        
        const drive = this.drives.get(this.selected)
        
        if (!drive) return undefined

        return drive
    }

    constructor(name?: string, drives?: Map<string, DriveContract>) {
        this.selected = name
        if (drives) {
            this.drives = drives
        }
    }

    public listDrives(): (DriveContract & { id: string })[] {
        return Array.from(this.drives.values())
    }
    
    public get(name?: string) {
        if (!name || !this.drives.has(name || '')) {
            throw new BaseException('Drive not found')
        }

        const drive = this.drives.get(name)

        if (!drive) {
            throw new BaseException('Drive not found')
        }

        return drive
    }

    public use(name?: string) {
        if (!this.drives.has(name || '')) {
            throw new BaseException('Drive not found')
        }
        
        return new DriveService(name, this.drives)
    }
    

    public list(folder?: string): Promise<DriveEntry[]> {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.list(folder)
    }

    public find(filename: string): Promise<DriveEntry> {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.find(filename)
    }

    public exists(filename: string): Promise<boolean> {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.exists(filename)
    }

    public read(filename: string): Promise<Uint8Array> {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.read(filename)
    }

    public write(filename: string, data: Uint8Array): Promise<void> {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.write(filename, data)
    }

    /**
     * Retrieve a URL for a file in the drive.
     * @param payload  File instance, File ID, DriveEntry instance or filename string
     * @param options 
     * @returns string
     */
    public async url(payload: File['id'] | File | DriveEntry | string, options: DriveUrlOptions = {}): Promise<string> {        
        if (payload instanceof File) {
            const drive = this.get(payload.drive)

            return drive.url(payload.filename, options)
        }

        if (payload instanceof DriveEntry) {
            const drive = this.get(this.selected)

            return drive.url(payload.path, options)
        }

        if (typeof payload === 'string') {
            const drive = this.get(this.selected)

            return drive.url(payload, options)
        }

        if (typeof payload === 'number') {
            const file = await File.findOrFail({
                query: qb => qb.selectAll()
                    .where('id', '=', payload)
                    .where(undeleted),
            })

            const drive = this.get(file.drive)

            return drive.url(file.filename, options)
        }

        throw new BaseException('Invalid payload')
    }

    /**
     * Upload a file from the local filesystem to the drive.
     * @param source filename in local filesystem
     * @param destination 
     * @returns 
     */
    public async upload(source: string, destination: string): Promise<void> {
        const buffer = await fs.promises.readFile(source)

        const uint8 = new Uint8Array(buffer)

        return this.write(destination, uint8)
    }

    /**
     * Download a file from the drive to the local filesystem.
     * @param filename filename in the drive
     * @param destination 
     * @returns 
     */
    public async download(filename: string, destination: string): Promise<void> {
        const data = await this.read(filename)
        
        await fs.promises.writeFile(destination, data)
    }

    public delete(filename: string): Promise<void> {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.delete(filename)
    }

    public getDrive<T extends DriveContract>(id: string): T{
        const drive = this.drives.get(id)
        
        if (!drive) {
            throw new BaseException('Drive not found')
        }

        return drive as T
    }

    public load(){
        this.drives.clear()

        const items = config.get('drive.disks', {})

        for (const [id, item] of Object.entries<any>(items)) {
            if (item.driver === 'filesystem') {
                const drive = new FilesystemDrive(id, item)
                
                this.drives.set(id, drive)

                if (item.default) {
                    this.selected = id
                }
            }
        }
    }

    public async createFile(options: CreatePayload) {
        const file = options.file
            
        const drive = this.use(options.drive || this.selected)
            
        const mimetype = mime.getType(file.originalname)
        const ext = mime.getExtension(mimetype || '') || file.originalname.split('.').pop()
        const filename = randomUUID() + (ext ? `.${ext}` : '')
            
        await drive.write(filename, file.buffer)
            
        const entity = await File.create({
            client_name: file.originalname,
            drive: drive.selected!,
            mimetype: mimetype || file.mimetype,
            metadata: options.metadata ? JSON.stringify(options.metadata) : null,
            filename: filename,
        })
            
        return entity
    }

    public createDefaulDrives(){
        config.set('drive.disks.storage', {
            "driver": "filesystem",
            "default": true,
            "path": storagePath('drive'),
            "name": "Storage",
            "description": "Storage directory"
        })
        
        config.set('drive.disks.root', {
            "driver": "filesystem",
            "path": "/",
            "name": "Root",
            "description": "Root directory"
        })
    }
}
