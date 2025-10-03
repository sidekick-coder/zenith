import type ms from 'ms'
import type DriveEntry from '#shared/entities/driveEntry.entity.ts'

interface DriveUrlOptions {
    expires?: ms.StringValue; // ms format, e.g. '1h', '30m', '15s'
}

export default interface DriveContract {
    id: string;
    name: string;
    description?: string;
    list(folder?: string): Promise<DriveEntry[]>;
    find(filename: string): Promise<DriveEntry>;
    exists(filename: string): Promise<boolean>;
    read(filename: string): Promise<Uint8Array>;
    write(filename: string, data: Uint8Array): Promise<void>;
    delete(filename: string): Promise<void>;
    url(filename: string, options?: DriveUrlOptions): Promise<string>;
}
