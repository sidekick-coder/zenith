import config from "./config.service.ts";
import { logger } from "../logger.ts";
import { basePath } from "../utils/paths.ts";
import * as fs from 'fs';
import path from "path";

export class BuildService {
    public async prepare() {
        const modulesEnabled = config.get('modules.enabled', []);
        const pageFiles = new Map<string, string>();

        for (const moduleName of modulesEnabled) {
            const filename = basePath(`modules/${moduleName}/pages.ts`);

            if (fs.existsSync(filename)) {
                pageFiles.set(moduleName, `export * from '@modules/${moduleName}/pages.ts'`);
            }
        }

        for (const [moduleName, content] of pageFiles.entries()) {
            const outputFile = basePath('client', 'routes', `modules.${moduleName}.ts`);
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            fs.writeFileSync(outputFile, content);

            logger.debug(`Built pages for module: ${moduleName}`);
        }
    }
}

const build = new BuildService();

export default build;
