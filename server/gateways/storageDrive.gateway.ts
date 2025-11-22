import FilesystemDrive from './filesystemDrive.gateway.ts'
import { storagePath } from '#server/utils/paths.ts'

export default class StorageDrive extends FilesystemDrive {
    constructor() {
        super('storage', {
            path: storagePath(),
            name: 'Storage Drive',
            description: 'Default storage drive for application files'
        })
    }
}