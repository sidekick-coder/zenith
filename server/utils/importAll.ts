import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'
import fg from 'fast-glob'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import logger from '#server/facades/logger.facade.ts'

interface Options {
    onBeforeImport?: (ctx: { filename: string }) => void | Promise<void>;
    onAfterImport?: (ctx: { filename: string, module: any }) => void | Promise<void>;
    exclude?: string[];
}
export async function importFiles(files: string[], options: Options = {}): Promise<Record<string, any>> {
    const modules: Record<string, any> = {}

    for (const filename of files) {
        if (options.exclude && options.exclude.some(pattern => filename.includes(pattern))) {
            continue
        }

        const ctx = { filename }

        if (options.onBeforeImport) {
            await options.onBeforeImport(ctx)
        }

        const cleanFilename = ctx.filename.split('?')[0]

        if (/\.(mts|ts)$/.test(cleanFilename)) {
            const abs = path.resolve(ctx.filename)
            const fileUrl = pathToFileURL(abs).href

            const [error, mod] = await tryCatch(() => import(fileUrl))
            
            if (error) {
                Object.assign(error, {
                    filename: ctx.filename,
                    url: fileUrl,
                })
                logger.error(`Failed to import file: ${ctx.filename}`, error)
                continue
            }

            modules[filename] = mod
        }
        
        if (/\.json$/.test(cleanFilename)) {
            const [error, json] = await tryCatch(async () => {
                const text = await fs.promises.readFile(ctx.filename, 'utf8')

                return JSON.parse(text)
            })

            if (error) {
                logger.error(`Failed to import JSON file: ${ctx.filename}`, { error })
                continue
            }

            modules[filename] = json
        }

        if (options.onAfterImport) {
            await options.onAfterImport({
                ...ctx,
                module: modules[filename]
            })
        }
    }

    return modules
}

export async function importGlob(pattern: string, options: Options = {}): Promise<Record<string, any>> {
    const files = await fg(pattern)

    return importFiles(files as string[], options)
}

export async function importAll(directory: string, options: Options = {}): Promise<Record<string, any>> {
    const dirents = await fs.promises.readdir(directory, { withFileTypes: true })
    
    const files = dirents
        .filter(dirent => dirent.isFile())
        .map(dirent => path.join(directory, dirent.name))

    return importFiles(files, options)
}
