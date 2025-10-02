import fs from 'fs'
import type DriveContract from '#server/contracts/drive.contract.ts'
import type DriveEntry from '#shared/entities/driveEntry.entity.ts'
// import FsDrive from '#server/gateways/FsDrive.ts'
// import { storagePath } from '#server/utils/paths.ts'
import BaseException from '#server/exceptions/base.ts'
import config from '#server/facades/config.facade.ts'
import FilesystemDrive from '#modules/callory-tracker/root/server/gateways/filesystemDrive.gateway.ts'

export default class DriveService {
    private drives: Map<string, DriveContract> = new Map()
    private selected?: string

    public get current() {
        if (!this.selected) return undefined 
        
        const drive = this.drives.get(this.selected)
        
        if (!drive) return undefined

        return drive
    }

    constructor(name?: string) {
        this.selected = name
    }

    public listDrives(): (DriveContract & { id: string })[] {
        return Array.from(this.drives.entries()).map(([id, drive]) => ({
            id,
            ...drive 
        }))
    }

    public use(name: string) {
        return new DriveService(name)
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

    public url(entry: DriveEntry){
        if (!this.current) throw new BaseException('No drive selected')

        return this.current.url(entry)
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
                const drive = new FilesystemDrive(item.root)

                drive.metas = {
                    name: item.name || id,
                    description: item.description || '',
                }
                
                this.drives.set(id, drive)

                if (item.default) {
                    this.selected = id
                }
            }
        }
    }
}
