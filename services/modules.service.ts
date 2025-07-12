import config from "./config.service.ts";
import { logger } from "../logger.ts";
import fs from 'fs';
import { basePath } from "../utils/paths.ts";
import build from "./build.service.ts";
import router from "./router.service.ts";
import env from "../env.ts";

interface ModuleFile {
    source?: string;
    filename: string;
    content: string;
}

interface Options {
    build?: boolean;
}

class Module {
    public id: string;
    public name: string;
    public enabled: boolean = false;

    constructor(name: string) {
        this.id = name;
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

    public async find(moduleName: string) {
        const allModules = await this.list();

        const mod = allModules.find(mod => mod.name === moduleName);

        return mod || null;
    }

    public async enable(moduleName: string, options: Options = {}) {
        const mod = await this.find(moduleName);

        if (!mod) {
            throw new Error(`Module ${moduleName} not found`);
        }

        if (mod.enabled) {
            logger.debug(`Module ${moduleName} is already enabled`);
            return;
        }

        for await (const file of this.getFiles(moduleName)) {
            fs.writeFileSync(file.filename, file.content, 'utf-8');

            logger.debug(`module file: ${file.filename}`);
        }

        await router.loadFile(mod.makePath('server', 'routes.ts'));

        if (options?.build || env.isProduction) {
            await build.all();
        }

        let enabled = config.get('modules.enabled', []);

        enabled.push(moduleName);

        enabled = [...new Set(enabled)]; // Ensure unique entries

        config.set('modules.enabled', enabled);

        logger.info(`module ${moduleName} enabled`);
    }

    public async disable(moduleName: string, options: Options = {}) {
        const mod = await this.find(moduleName);

        if (!mod) {
            throw new Error(`Module ${moduleName} not found`);
        }

        if (!mod.enabled) {
            logger.debug(`Module ${moduleName} is already disabled`);
            return;
        }


        for (const file of this.getFiles(moduleName)) {
            if (!fs.existsSync(file.filename)) continue;

            fs.unlinkSync(file.filename);

            logger.debug(`removing module file: ${file.filename}`);
        }

        await router.removeFile(mod.makePath('server', 'routes.ts'));

        console.log(env)

        if (options?.build || env.isProduction) {
            await build.all();
        }

        const enabled = config.get('modules.enabled', []);

        const index = enabled.indexOf(moduleName);

        if (index > -1) {
            enabled.splice(index, 1);
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
