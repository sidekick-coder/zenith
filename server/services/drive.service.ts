import fs from 'fs'
import type DriveContract from '#server/contracts/drive.contract.ts'
import DriveEntry from '#shared/entities/driveEntry.entity.ts'
import BaseException from '#server/exceptions/base.ts'
import config from '#server/facades/config.facade.ts'
import FilesystemDrive from '#server/gateways/filesystemDrive.gateway.ts'
import type { DriveUrlOptions } from '#server/contracts/drive.contract.ts'
import { storagePath } from '#server/utils/paths.ts'

interface ValidateUploadOptions {
    mime_types: string
    maxSize?: number
}

export default class DriveService {
    public drives: Map<string, DriveContract> = new Map()
    public selected?: string
    public defaultDrive?: string
    public debug = false

    public get current() {
        if (!this.selected) return undefined 
        
        const drive = this.drives.get(this.selected)
        
        if (!drive) return undefined

        return drive
    }

    constructor(data: Partial<DriveService> = {}) {        
        this.selected = data.selected || this.selected
        this.debug = data.debug || this.debug
        this.drives = data.drives || this.drives
    }

    public listDrives(): (DriveContract & { default: boolean })[] {
        return Array.from(this.drives.values()).map(drive => ({
            ...drive,
            default: drive.id === this.defaultDrive
        }))
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
        
        return new DriveService({ 
            selected: name,
            drives: this.drives,
            debug: this.debug 
        })
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

    public readStream(filename: string) {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.readStream(filename)
    }

    public write(filename: string, payload: Uint8Array | string | Record<string, unknown> ): Promise<void> {
        if (!this.current) throw new BaseException('No drive selected')

        let data: any = payload
        
        if (typeof payload === 'object' && !(payload instanceof Uint8Array)) {
            data = JSON.stringify(payload, null, 4)
        }

        if (typeof data === 'string') {
            data = new TextEncoder().encode(data)
        }

        return this.current.write(filename, data)
    }

    public writeStream(filename: string, stream: NodeJS.ReadableStream): Promise<void> {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.writeStream(filename, stream)
    }

    /**
     * Retrieve a URL for a file in the drive.
     * @param payload  File instance, File ID, DriveEntry instance or filename string
     * @param options 
     * @returns string
     */
    public async url(filename: string, options: DriveUrlOptions = {}): Promise<string> {        
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.url(filename, options)
    }

    public async uploadUrl(filename: string, options: DriveUrlOptions = {}): Promise<string> {        
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.uploadUrl(filename, options)
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
                const drive = new FilesystemDrive(id, item) as any
                
                this.drives.set(id, drive)
            }

            if (item.default) {
                this.selected = id
                this.defaultDrive = id
            }
        }
    }

    public createDefaultDrives(){
        config.set('drive.disks.storage', {
            'driver': 'filesystem',
            'default': true,
            'path': storagePath('drive'),
            'name': 'Storage',
            'description': 'Storage directory'
        })
        
        config.set('drive.disks.root', {
            'driver': 'filesystem',
            'path': '/',
            'name': 'Root',
            'description': 'Root directory'
        })

        this.load()
    }

    public validateUpload(options: ValidateUploadOptions, file: { mimetype: string, size: number },) {
        const allowedTypes = options.mime_types.split(',').map(t => t.trim())

        const isAllowed = allowedTypes.some(allowedType => {
            if (!allowedType.endsWith('/*')) {
                return allowedType === file.mimetype
            }
            
            const baseType = allowedType.slice(0, -2)

            return file.mimetype.startsWith(baseType + '/')
        })

        if (!isAllowed) {
            throw new BaseException('MIME type not allowed', 403)
        }

        if (options.maxSize && file.size > options.maxSize) {
            throw new BaseException('File size exceeds the maximum allowed', 403)
        }
    }
}
