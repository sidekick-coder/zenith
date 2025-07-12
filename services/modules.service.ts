import config from "./config.service.ts";
import { logger } from "../logger.ts";
import fs from 'fs';
import { basePath } from "../utils/paths.ts";
import path from "path";

export class ModulesService {
    public async enable(moduleName: string) {
        const enabled = config.get('modules.enabled', []);

        if (enabled.includes(moduleName)) return;

        const pagesFile = basePath(`modules/${moduleName}/pages.ts`);

        if (fs.existsSync(pagesFile)) {
            const outputFile = basePath('client', 'routes', `modules.${moduleName}.ts`);
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            fs.writeFileSync(outputFile, `import pages from '@modules/${moduleName}/pages.ts';\n\nexport default pages;`, 'utf-8');
        }


        enabled.push(moduleName);

        config.set('modules.enabled', enabled);

        logger.info(`module ${moduleName} enabled`);
    }

    public async disable(moduleName: string) {
        const enabled = config.get('modules.enabled', []);

        if (!enabled.includes(moduleName)) return;

        const index = enabled.indexOf(moduleName);

        if (index > -1) {
            enabled.splice(index, 1);
        }

        const files = [basePath('client', 'routes', `modules.${moduleName}.ts`)];

        for (const file of files) {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                logger.debug(`Removed module route file: ${file}`);
            }
        }

        config.set('modules.enabled', enabled);

        logger.info(`module ${moduleName} disabled`);
    }
}

const modules = new ModulesService();

export default modules;
