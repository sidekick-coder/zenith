import di from './di.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export async function importServer(filename: string) {
    const path = await import('path')

    let filepath = filename

    if (filepath.startsWith('/modules')) {
        filepath = path.resolve(filename.slice(1))
    }

    const { pathToFileURL } = await import('url')

    const fileUrl = pathToFileURL(filepath).href + `?t=${Date.now()}` // bust cache

    return await import(/* @vite-ignore */ fileUrl) // bust cache
}

export async function importClient(filename: string) {
    const url = filename + `?t=${Date.now()}` // bust cache

    const [error, mod] = await tryCatch(async () => await import(/* @vite-ignore */ url))

    if (error) {
        console.error('Error importing setup file:', error)
        return null
    }

    return mod
}

export async function getDevelopmentSetupFiles() {
    if (import.meta.env.PROD) {
        return {}
    }
    
    const result = {} as Record<string, any>

    const modules = import.meta.glob('/modules/*/client/setup.client.{ts,js}')


    for (const [path, importFn] of Object.entries(modules)) {                
        result[path] = importFn
        result[`/static${path}`] = importFn
    }

    return result
}

export async function listSetupFiles() {
    const key = di.get('isServer') ? 'client:setups:server' : 'client:setups:client'
    const files = di.get(key, []) as string[]
    const imports = await getDevelopmentSetupFiles()

    const importFn = di.get('isServer') ? importServer : importClient
    const result: Record<string, any> = {}

    for await (const f of files) {
        const devImport = imports[f]

        // if (devImport) {
        //     result[f] = await devImport()
        //     continue
        // }

        const mod = await importFn(f)

        if (mod) {
            result[f] = mod
        }
    }

    return result
}