import type FileEntity from '#server/entities/file.entity.ts'

export default interface DriveContract {
    metas: Record<string, any>;
    list(folder?: string): Promise<FileEntity[]>;
    find(filename: string): Promise<FileEntity>;
    read(filename: string): Promise<Uint8Array>;
    write(filename: string, data: Uint8Array): Promise<void>;
    delete(filename: string): Promise<void>;
}
