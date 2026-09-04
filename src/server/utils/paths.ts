import { basePath as kitBasePath } from '@sidekick-coder/zenith-kit/server'

/** @deprecated use basePath from zenith-kit instead */
export function basePath(...args: string[]): string {
    return kitBasePath(...args)
}

export function serverPath(...args: string[]): string {
    return basePath('server', ...args)
}

export function clientPath(...args: string[]): string {
    return basePath('src', 'client', ...args)
}

export function storagePath(...args: string[]): string {
    return basePath('storage', ...args)
}

export function tmpPath(...args: string[]): string {
    return basePath('tmp', ...args)
}
