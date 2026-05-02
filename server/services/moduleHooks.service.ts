import fs from 'fs'
import path from 'path'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import logger from '#server/facades/logger.facade.ts'
import shell from '#server/facades/shell.facade.ts'
import { basePath } from '#server/utils/paths.ts'
import type ModuleManifest from '#shared/entities/moduleManifest.entity.ts'
import { importFiles } from '#server/utils/importAll.ts'

export interface BaseOptions {
    id: string
}

export interface ZipModuleOptions extends BaseOptions {
    filename: string
}

export interface GitModuleOptions extends BaseOptions {
    repository: string
    branch?: string
    key?: string // SSH private key
}

export default class ModuleHooksService {
    public logger: typeof logger
    public shell: typeof shell
    public manifests: Map<string, ModuleManifest>
    public debug: boolean
    public hooks: LifecycleHook[] = []

    constructor(data: Partial<ModuleHooksService> = {}) {
        this.logger = data.logger || logger.child({ label: 'modules.hooks' })
        this.shell = data.shell || shell
        this.manifests = data.manifests || new Map<string, ModuleManifest>()
        this.debug = data.debug || false
    }

    public async discover(): Promise<void> {
        const files = [] as string[]

        for (const manifest of this.manifests.values()) {
            if (!manifest.enabled) {
                continue
            }

            const file = path.join(basePath('modules'), manifest.id, 'server/module.server.ts')
            const folder = path.join(basePath('modules'), manifest.id, 'server/hooks')

            if (fs.existsSync(file)) {
                files.push(file)
            }

            if (fs.existsSync(folder)) {
                const hookFiles = fs.readdirSync(folder)
                    .filter(file => file.endsWith('.ts'))
                    .map(file => path.join(folder, file))

                files.push(...hookFiles)
            }
        }

        const imports = await importFiles(files)

        Object.values(imports).map(m => m.default || m)
            .filter((HookClass: any) => HookClass.prototype instanceof LifecycleHook)
            .forEach((HookClass: any) => {
                const hook = new HookClass()

                this.hooks.push(hook)
            })

    }

}
