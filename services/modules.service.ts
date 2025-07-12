import config from "./config.service.ts";
import { logger } from "../logger.ts";

export class ModulesService {
    public async enable(moduleName: string) {
        const enabled = config.get('modules.enabled', []);

        if (enabled.includes(moduleName)) return;

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

        config.set('modules.enabled', enabled);

        logger.info(`module ${moduleName} disabled`);
    }
}

const modules = new ModulesService();

export default modules;
