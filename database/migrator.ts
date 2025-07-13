import { FileMigrationProvider, Migrator as KyselyMigrator } from "kysely";
import { basePath } from "../utils/paths.ts";
import { db } from "./index.ts";
import fs from 'fs';
import path from 'path';

export class Migrator {
    public async list(){
        const migrator = new KyselyMigrator({
            db,
            provider: new FileMigrationProvider({
                fs: fs.promises,
                path: path,
                migrationFolder: basePath('database', 'migrations'),
            })
        })

        const items = await migrator.getMigrations()

        return items;
    }
}

const migrator = new Migrator()

export default migrator;
