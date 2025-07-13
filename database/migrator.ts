import {  Migrator as KyselyMigrator } from "kysely";
import { basePath } from "../utils/paths.ts";
import { db } from "./index.ts";
import fs from 'fs';
import modules from "../services/modules.service.ts";
import { MultiFolderMigrationProvider } from "./multiFolderMigrationProvider.ts";

export class Migrator {
    public async make() {
        const folders: string[] = [
            basePath('database', 'migrations'),
        ];

        const mods = await modules.list();

        for (const mod of mods) {
            if (fs.existsSync(mod.makePath('server', 'database', 'migrations'))) {
                folders.push(mod.makePath('server', 'database', 'migrations'));
            }
        }

        return new KyselyMigrator({
            db,
            provider: new MultiFolderMigrationProvider(folders),
        })
    }

    public async list() {
        const migrator = await this.make();

        return await migrator.getMigrations();
    }

    public async up() {
        const migrator = await this.make();

        return await migrator.migrateUp();
    }

    public async down() {
        const migrator = await this.make();

        return await migrator.migrateDown();
    }

    public async latest() {
        const migrator = await this.make();

        return await migrator.migrateToLatest();
    }
}

const migrator = new Migrator()

export default migrator;
