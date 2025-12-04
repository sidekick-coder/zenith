import fs from 'fs'
import path from 'path'
import Router from './router.service.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export default class RouterRegister<C = {}> extends Router<C> {
    public files = new Set<string>()
    public dirs = new Set<string>()
    
    constructor(router: Partial<Router<C>> = {}) {
        super(router)
    }

    public addFile(filename: string) {
        this.files.add(filename)
    }

    public addDir(dirname: string) {
        this.dirs.add(dirname)
    }

    private async loadFile(filename: string) {
        if (!fs.existsSync(filename)) {
            this.logger.warn(`File not found: ${filename}`)
            return
        }
    
        const path = `${filename}?t=${Date.now()}` // Prevent caching issues
    
        const [error] = await tryCatch(() => import(path))
    
        if (error) {
            this.logger.error('failed to load file', {
                filename,
                error
            })

            return false
        }

        return true
    }

    public async load() {
        const loaded = new Set<string>()

        for (const file of this.files) {
            
            const stat = fs.statSync(file)

            if (!stat.isFile() && stat.isDirectory()) {
                continue
            }

            if ((await this.loadFile(file))) {
                loaded.add(file)
            }
        }

        for (const dir of this.dirs) {
            const files = fs.readdirSync(dir)

            for (const file of files) {
                const fullPath = path.join(dir, file)

                const stat = fs.statSync(fullPath)

                if (!stat.isFile() && stat.isDirectory()) {
                    continue
                }

                if ((await this.loadFile(fullPath))) {
                    loaded.add(fullPath)
                }
            }
        }

        if (this.debug) {
            this.logger.debug('load files', {
                files: Array.from(loaded).map(p => path.relative(process.cwd(), p)),
            })
        }
    }
}