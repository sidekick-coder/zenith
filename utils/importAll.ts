import fs from 'fs'
import path from 'path';

interface Options {
    onBeforeImport?: (filename: string) => void | Promise<void>;
    onAfterImport?: (filename: string, module: any) => void | Promise<void>;
}

export async function importAll(directory: string, options: Options = {}): Promise<Record<string, any>> {
    const files = fs.readdirSync(directory, { withFileTypes: true })

    const modules = {}

    for await (const file of files) {
        if (!file.isFile()) continue

        const filename = path.join(directory, file.name)

        if (options.onBeforeImport) {
            await options.onBeforeImport(filename)
        }

        modules[file.name] = await import(filename)

        if (options.onAfterImport) {
            await options.onAfterImport(filename, modules[file.name])
        }
    }

    return modules
}
