import path from 'path'
import fs from 'fs'
import fg from 'fast-glob'

interface Options {
    onBeforeImport?: (ctx: { filename: string }) => void | Promise<void>;
    onAfterImport?: (ctx: { filename: string, module: any }) => void | Promise<void>;
}
export async function importFiles(files: string[], options: Options = {}): Promise<Record<string, any>> {
    const modules: Record<string, any> = {}

    for (const filename of files) {
        const ctx = { filename }

        if (options.onBeforeImport) {
            await options.onBeforeImport(ctx)
        }

        modules[filename] = await import(ctx.filename)

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

    return importFiles(files, options)
}

export async function importAll(directory: string, options: Options = {}): Promise<Record<string, any>> {
    const dirents = await fs.promises.readdir(directory, { withFileTypes: true })
    
    const files = dirents
        .filter(dirent => dirent.isFile())
        .map(dirent => path.join(directory, dirent.name))

    return importFiles(files, options)
}
