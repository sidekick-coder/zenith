import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

export function basePath(...args: string[]): string {
    const root = path.resolve(__dirname, '..', '..')

    return path.resolve(root, ...args)
}

export function serverPath(...args: string[]): string {
    return basePath('server', ...args)
}

export function clientPath(...args: string[]): string {
    return basePath('client', ...args)
}

export function storagePath(...args: string[]): string {
    return basePath('storage', ...args)
}

export function configPath(...args: string[]): string {
    return storagePath('config', ...args)
}

export function tmpPath(...args: string[]): string {
    return storagePath('tmp', ...args)
}