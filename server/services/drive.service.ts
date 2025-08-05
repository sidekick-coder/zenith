import type DriveContract from '#server/contracts/drive.contract.ts'
import type FileEntity from '#server/entities/file.entity.ts'
import FsDrive from '#server/gateways/FsDrive.ts'
import { storagePath } from '#server/utils/paths.ts'

export default class DriveService {
    private static drives: Map<string, DriveContract> = new Map()
    private selected: DriveContract

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

    public list(folder?: string): Promise<FileEntity[]> {
        return this.selected.list(folder)
    }

    public find(filename: string): Promise<FileEntity> {
        return this.selected.find(filename)
    }

    public read(filename: string): Promise<Uint8Array> {
        return this.selected.read(filename)
    }

    public write(filename: string, data: Uint8Array): Promise<void> {
        return this.selected.write(filename, data)
    }

    public delete(filename: string): Promise<void> {
        return this.selected.delete(filename)
    }

}

const defaultDrive = new FsDrive(storagePath('drive'))

defaultDrive.metas = {
    name: 'Local Filesystem',
    description: 'Default local filesystem drive',
    editable: false,
}

DriveService.register('storage', defaultDrive)