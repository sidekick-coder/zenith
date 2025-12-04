import fs from 'fs'
import path from 'path'
import Router from './router.service.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export default class RouterRegister<C = {}> extends Router<C> {
    public files = new Set<string>()
    public dirs = new Set<string>()
    
    constructor(router: Router) {
        super({
            routes: router.routes,
            middlewares: router.middlewares,
            prefixes: router.prefixes,
            groups: router.groups,
            groupPrefixes: router.groupPrefixes,
            debug: router.debug,
        })
    }

    public addFile(filename: string) {
        this.files.add(filename)

        if (this.debug) {
            this.logger.debug('added file', {
                filename,
            })
        }
    }

    public addDir(dirname: string) {
        this.dirs.add(dirname)

        if (this.debug) {
            this.logger.debug('added directory', {
                dirname,
            })
        }
    }

    private async loadFile(filename: string) {
        if (!fs.existsSync(filename)) {
            this.logger.warn(`File not found: ${filename}`)
            return
        }
    
        const path = `${filename}?t=${Date.now()}` // Prevent caching issues
    
        const [error] = await tryCatch(() => import(path))
    
        if (error) {
            this.logger.error('failed to load routes from file', {
                filename,
                error
            })
        }
    
        if (this.debug) {
            this.logger.debug('loaded routes file', {
                filename,
            })
        }
    }

    public async load() {
        for (const file of this.files) {
            await this.loadFile(file)
        }

        for (const dir of this.dirs) {
            const files = fs.readdirSync(dir)

            for (const file of files) {
                const fullPath = path.join(dir, file)

                const stat = fs.statSync(fullPath)

                if (stat.isFile() && file.endsWith('.ts')) {
                    await this.loadFile(fullPath)
                }
            }
        }
    }
}