import fs from 'fs'
import type DriveContract from '#server/contracts/drive.contract.ts'
import type DriveEntry from '#shared/entities/driveEntry.entity.ts'
import FsDrive from '#server/gateways/FsDrive.ts'
import { storagePath } from '#server/utils/paths.ts'
import BaseException from '#server/exceptions/base.ts'

export default class DriveService {
    private static drives: Map<string, DriveContract> = new Map()
    private selected: DriveContract
    public get selectedName(): string {
        for (const [name, drive] of DriveService.drives.entries()) {
            if (drive === this.selected) {
                return name
            }
        }

        return 'unknown'
    }

    constructor(name: string = 'storage') {
        const drive = DriveService.drives.get(name)
        
        if (!drive) {
            throw new Error(`Drive with name "${name}" not found.`)
        }

        this.selected = drive
    }

    public static register(name: string, drive: DriveContract): void {
        if (this.drives.has(name)) {
            throw new Error(`Drive with name "${name}" already exists.`)
        }

        this.drives.set(name, drive)
    }

    public listDrives(): (DriveContract & { id: string })[] {
        return Array.from(DriveService.drives.entries()).map(([id, drive]) => ({
            id,
            ...drive 
        }))
    }

    public use(name: string) {
        return new DriveService(name)
    }

    public list(folder?: string): Promise<DriveEntry[]> {
        return this.selected.list(folder)
    }

    public find(filename: string): Promise<DriveEntry> {
        return this.selected.find(filename)
    }

    public exists(filename: string): Promise<boolean> {
        return this.selected.exists(filename)
    }

    public read(filename: string): Promise<Uint8Array> {
        return this.selected.read(filename)
    }

    public write(filename: string, data: Uint8Array): Promise<void> {
        return this.selected.write(filename, data)
    }

    public url(entry: DriveEntry){
        if (!this.selected.url) {
            return undefined
        }

        return this.selected.url(entry)
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
        return this.selected.delete(filename)
    }

    public getDrive<T extends DriveContract>(id: string): T{
        const drive = DriveService.drives.get(id)
        
        if (!drive) {
            throw new BaseException('Drive not found')
        }

        return drive as T
    }

    

}

const root = new FsDrive('/')
const storage = new FsDrive(storagePath('drive'))

storage.url = async (entry: DriveEntry) => {
    return `/api/files/${encodeURIComponent(entry.path)}`
}

root.metas = {
    name: 'Root',
    description: 'Root filesystem drive',
    editable: false,
}

storage.metas = {
    name: 'Local Filesystem',
    description: 'Default local filesystem drive',
    editable: false,
}

DriveService.register('root', root)
DriveService.register('storage', storage)