import config from "./config.service.ts";
import { logger } from "../logger.ts";
import fs from 'fs';
import { basePath } from "../utils/paths.ts";
import path from "path";
import build from "./build.service.ts";
import env from "../env.ts";

const isProduction = env.NODE_ENV === 'production';

interface ModuleFile {
    source?: string;
    filename: string;
    content: string;
}

interface Options {
    build?: boolean;
}

class Module {
    public name: string;
    public enabled: boolean = false;

    constructor(name: string) {
        this.name = name;
    }

    public makePath(...parts: string[]) {
        return basePath('modules', this.name, ...parts);
    }
}

interface ListOptions {
    enabled?: boolean;
}

export class ModulesService {
    public getFiles(moduleName: string) {
        const files: ModuleFile[] = [];

        if (fs.existsSync(basePath(`modules/${moduleName}/app/routes.ts`))) {
            files.push({
                source: basePath(`modules/${moduleName}/app/routes.ts`),
                filename: basePath(`app/routes/module.${moduleName}.ts`),
                content: [
                    `import original from '@modules/${moduleName}/app/routes.ts'`,
                    '',
                    'export default original;',
                ].join('\n'),
            })
        }

        if (fs.existsSync(basePath(`modules/${moduleName}/app/menu.ts`))) {
            files.push({
                source: basePath(`modules/${moduleName}/app/menu.ts`),
                filename: basePath(`app/menu/module.${moduleName}.ts`),
                content: [
                    `import original from '@modules/${moduleName}/app/menu.ts'`,
                    '',
                    'export default original;',
                ].join('\n'),
            });
        }

        return files;
    }

    public async list(options: ListOptions = {}) {
        const modulesPath = basePath('modules');
        const moduleNames = fs.readdirSync(modulesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const enabled = config.get('modules.enabled', []);

        let items = [] as Module[];

        for (const name of moduleNames) {
            const mod = new Module(name);

            mod.enabled = enabled.includes(name);

            items.push(mod);
        }

        if (options?.enabled) {
            items = items.filter(mod => mod.enabled);
        }

        return items;
    }

    public async enable(moduleName: string, options: Options = {}) {
        const enabled = config.get('modules.enabled', []);

        if (enabled.includes(moduleName)) return;

        for await (const file of this.getFiles(moduleName)) {
            fs.writeFileSync(file.filename, file.content, 'utf-8');

            logger.debug(`module file: ${file.filename}`);
        }

        if (options?.build) {
            await build.all();
        }

        enabled.push(moduleName);

        config.set('modules.enabled', enabled);

        logger.info(`module ${moduleName} enabled`);
    }

    public async disable(moduleName: string, options: Options = {}) {
        const enabled = config.get('modules.enabled', []);

        if (!enabled.includes(moduleName)) return;

        const index = enabled.indexOf(moduleName);

        if (index > -1) {
            enabled.splice(index, 1);
        }

        for (const file of this.getFiles(moduleName)) {
            if (!fs.existsSync(file.filename)) continue;

            fs.unlinkSync(file.filename);

            logger.debug(`removing module file: ${file.filename}`);
        }

        if (options?.build) {
            await build.all();
        }

        config.set('modules.enabled', enabled);

        logger.info(`module ${moduleName} disabled`);
    }

    public async toggle(moduleName: string, options: Options = {}) {
        const enabled = config.get('modules.enabled', []);

        if (enabled.includes(moduleName)) {
            return this.disable(moduleName, options);
        }

        return await this.enable(moduleName, options);
    }
}

const modules = new ModulesService();

export default modules;
