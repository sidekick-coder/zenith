import di from './di.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

export async function importServer(moduleId: string, filename: string) {
    const fs = await import('fs')
    const path = await import('path')
    const { pathToFileURL } = await import('url')

    const modulePath = path.resolve(`modules/${moduleId}/client/${filename}`)

    if (!fs.existsSync(modulePath)) return null

    const fileUrl = pathToFileURL(modulePath).href

    return await import(/* @vite-ignore */ fileUrl + `?t=${Date.now()}`) // bust cache
}

export async function importClient(moduleId: string, filename: string) {
    const url = `/static/modules/${moduleId}/${filename}` + `?t=${Date.now()}` // bust cache

    const [error, mod] = await tryCatch(async () => await import(/* @vite-ignore */ url))

    if (error) return null

    return mod
}

export async function getDevelopmentSetupFiles() {
    if (!import.meta.env.DEV) {
        return {}
    }

    const modules = import.meta.glob('/modules/*/client/setup.client.{ts,js}')

    const result = {} as Record<string, any>

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

    // console.log('files:', files)
    // console.log('imports:', Object.keys(imports))

    const importFn = di.get('isServer') ? importServer : importClient
    const result: Record<string, any> = {}

    for await (const f of files) {
        const devImport = imports[f]

        if (devImport) {
            result[f] = await devImport()
            continue
        }

    }

    console.log(result)    

    return result
}