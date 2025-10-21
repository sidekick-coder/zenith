import fs from 'fs'
import { randomUUID } from 'crypto'
import path from 'path'
import mime from 'mime'
import { undeleted } from '#server/queries/index.ts'
import type DriveContract from '#server/contracts/drive.contract.ts'
import DriveEntry from '#shared/entities/driveEntry.entity.ts'
import BaseException from '#server/exceptions/base.ts'
import config from '#server/facades/config.facade.ts'
import FilesystemDrive from '#server/gateways/filesystemDrive.gateway.ts'
import File from '#server/entities/file.entity.ts'
import type { DriveUrlOptions } from '#server/contracts/drive.contract.ts'
import { storagePath, tmpPath } from '#server/utils/paths.ts'

interface CreateFileOptions {
    filename?: string
}

export default class DriveService {
    private drives: Map<string, DriveContract> = new Map()
    public selected?: string
    public defaultDrive?: string

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

    public readStream(filename: string) {
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.readStream(filename)
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

    public async createFile(buffer: Buffer, clientName: string) {            
        const mimetype = mime.getType(clientName)
        const ext = mime.getExtension(mimetype || '') || clientName.split('.').pop()
        const filename = randomUUID() + (ext ? `.${ext}` : '')

        await this.write(filename, buffer)
            
        const entity = await File.create({
            client_name: clientName,
            drive: this.selected!,
            mimetype: mimetype || 'application/octet-stream',
            filename: filename,
        })
            
        return entity
    } 
    
    public async createFileFromFilename(filename: string) {            
        const mimetype = mime.getType(filename)
            
        return await File.create({
            client_name: filename,
            filename: filename,
            drive: this.selected!,
            mimetype: mimetype || 'application/octet-stream',
        })
    } 

    public async createFileFromLocal(localFilePath: string, options?: CreateFileOptions) {
        // Check if file exists
        const fileExists = await fs.promises.access(localFilePath, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false)
        
        if (!fileExists) {
            throw new BaseException(`File not found: ${localFilePath}`)
        }

        // Get file stats and extract original name
        const stats = await fs.promises.stat(localFilePath)
        const originalName = path.basename(localFilePath)
        
        if (!stats.isFile()) {
            throw new BaseException(`Path is not a file: ${localFilePath}`)
        }

        // Determine mimetype
        const mimetype = mime.getType(originalName)
        const ext = mime.getExtension(mimetype || '') || originalName.split('.').pop()
        
        // Generate unique filename for storage
        const filename = options?.filename || randomUUID() + (ext ? `.${ext}` : '')
        
        // Upload to drive
        await this.upload(localFilePath, filename)
        
        return this.createFileFromFilename(filename)
    }


    public async createFileFromUrl(fileUrl: string, options?: CreateFileOptions) {
        // Download the file from URL
        const response = await fetch(fileUrl)
        
        if (!response.ok) {
            throw new BaseException(`Failed to download file from URL: ${response.statusText}`)
        }

        const buffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)

        // Extract filename from URL or generate a random one
        const urlPath = new URL(fileUrl).pathname
        const originalName = path.basename(urlPath) || `download-${randomUUID()}`
        
        // Determine mimetype
        const contentType = response.headers.get('content-type')
        const mimetype = contentType || mime.getType(originalName)
        const ext = mime.getExtension(mimetype || '') || originalName.split('.').pop()
        
        // Generate unique filename for storage
        const filename = randomUUID() + (ext ? `.${ext}` : '')
        
        // Create temporary file path
        const tmpFilePath = tmpPath(filename)
        
        // Write file to tmp directory
        await fs.promises.writeFile(tmpFilePath, uint8Array)

        return this.createFileFromLocal(tmpFilePath, options)
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
}
