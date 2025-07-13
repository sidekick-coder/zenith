import type { Migration, MigrationProvider } from 'kysely';
import path from 'path';
import fs from 'fs/promises';

export class MultiFolderMigrationProvider implements MigrationProvider {
    private folders: string[]

    constructor(folders: string[]) {
        this.folders = folders;
    }

    async getMigrations(): Promise<Record<string, Migration>> {
        const migrations: Record<string, Migration> = {};

        for (const folder of this.folders) {
            const entries = await fs.readdir(folder);
            for (const entry of entries) {
                const fullPath = path.join(folder, entry);
                if (entry.endsWith('.js') || entry.endsWith('.ts')) {
                    const migrationName = path.basename(entry, path.extname(entry));
                    if (migrations[migrationName]) {
                        throw new Error(`Duplicate migration name detected: ${migrationName}`);
                    }

                    const mod = await import(fullPath);
                    migrations[migrationName] = {
                        up: mod.up,
                        down: mod.down,
                    };
                }
            }
        }

        return migrations;
    }
}

