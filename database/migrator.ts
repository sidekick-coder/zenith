import { FileMigrationProvider, Migrator as KyselyMigrator } from "kysely";
import { basePath } from "../utils/paths.ts";
import { db } from "./index.ts";
import fs from 'fs';
import path from 'path';
import dbManager from "./manager.ts";

export class Migrator {
    public async make() {
        return new KyselyMigrator({
            db,
            provider: new FileMigrationProvider({
                fs: fs.promises,
                path: path,
                migrationFolder: basePath('database', 'migrations'),
            })
        })
    }

    public async list(){
        const migrator = await this.make();

        const items = await migrator.getMigrations()

        return items;
    }

    public async up() {
        const migrator = await this.make();

        const items = await migrator.migrateUp();

        return items;
    }

    public async down() {
        const migrator = await this.make();

        const items = await migrator.migrateDown();

        return items;
    }
}

const migrator = new Migrator()

export default migrator;
