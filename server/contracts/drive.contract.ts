import type FileEntity from '#server/entities/drive-entry.entity.ts'

export default interface DriveContract {
    metas: Record<string, any>;
    list(folder?: string): Promise<FileEntity[]>;
    find(filename: string): Promise<FileEntity>;
    exists(filename: string): Promise<boolean>;
    read(filename: string): Promise<Uint8Array>;
    write(filename: string, data: Uint8Array): Promise<void>;
    delete(filename: string): Promise<void>;
}
