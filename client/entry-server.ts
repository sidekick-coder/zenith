import { pathToFileURL } from 'url'
import fs from 'fs'
import path from 'path'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import di from './utils/di'
import { createServerFetcher } from './utils/fetcher'
import type { Logger } from './utils/logger'
import config from './facades/config.facade'
import { flatten } from '#shared/utils/flatten.ts'

interface RenderContext {
    url: string;
    router: any;
    cookies: Record<string, string>;
    state: Record<string, any>;
    logger: Logger
}


export async function importDynamicModule(modulePath: string) {
    if (!fs.existsSync(modulePath)) throw new Error(`Module not found: ${modulePath}`)
    const fileUrl = pathToFileURL(modulePath).href
    return await import(/* @vite-ignore */ fileUrl + `?t=${Date.now()}`) // bust cache
}


export async function render(context: RenderContext) {
    const url = context.url
    const serverRouter = context.router

    di.load(context.state)
    
    di.set('fetcher', createServerFetcher(serverRouter, context.cookies))
    di.set('logger', context.logger)

    const modulesEnabled: string[] = context.state['modules:enabled'] || [] 

    const clientSetup: any = {}

    for (const m of modulesEnabled) {
        const filename = path.resolve(`modules/${m}/client/setup.client.js`)
        
        const mod = await importDynamicModule(filename)

        clientSetup[filename] = mod.default
    }

    di.set('client:setups', clientSetup)

    for (const [key, value] of Object.entries(flatten(context.state.config || {}))) {
        config.entries.set(key, {
            key,
            value,
            source: 'state'
        })
    }

    const { app, router } = await createApp()

    await router.push(url)

    await router.isReady()

    const ctx = {}

    const html = await renderToString(app, ctx)

    return {
        html,
        router,
        hello: 'world',
    }
}
