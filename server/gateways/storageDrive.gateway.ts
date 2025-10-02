import FilesystemDrive from './filesystemDrive.gateway.ts'
import { storagePath } from '#server/utils/paths.ts'

export default class StorageDrive extends FilesystemDrive {
    constructor() {
        super(storagePath('drive'))
    }
}