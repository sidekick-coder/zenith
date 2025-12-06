import { pathToFileURL } from 'url'
import fs from 'fs'
import { renderToString } from 'vue/server-renderer'
import di from './utils/di'
import { createServerFetcher } from './utils/fetcher'
import type { Logger } from './utils/logger'
import config from './facades/config.facade'
import lifecycle from './facades/lifecycle.facade.ts'
import RouterLifecycleHook from './hooks/router.hook.ts'
import AppLifecycleHook from './hooks/app.hook.ts'
import AuthLifecycleHook from './hooks/auth.hook.ts'
import app from './facades/app.facade.ts'
import router from './facades/router.facade.ts'
import AclLifecycleHook from './hooks/acl.hook.ts'
import MenuLifecycleHook from './hooks/menu.hook.ts'
import { flatten } from '#shared/utils/flatten.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

const hooks = Object.values<any>(import.meta.glob('./hooks/**/*.hook.ts', { eager: true }))
    .map(hook => hook.default || hook) as LifecycleHook[]

lifecycle.add(...hooks)

if (!globalThis.imports) {
    globalThis.imports = {}
}

if (import.meta.env.SSR) {
    globalThis.imports['vue/server-renderer'] = () => import('vue/server-renderer')
}

interface RenderContext {
    url: string;
    router: any;
    cookies: Record<string, string>;
    state: Record<string, any>;
    logger: Logger
}


export async function importDynamicModule(modulePath: string) {
    if (!fs.existsSync(modulePath)) return null

    const fileUrl = pathToFileURL(modulePath).href

    return await import(/* @vite-ignore */ fileUrl + `?t=${Date.now()}`) // bust cache
}


export async function render(context: RenderContext) {
    const url = context.url
    const serverRouter = context.router

    di.load(context.state)
    
    di.set('fetcher', createServerFetcher(serverRouter, context.cookies))
    di.set('logger', context.logger)
    di.set('isServer', true)

    for (const [key, value] of Object.entries(flatten(context.state.config || {}))) {
        config.entries.set(key, {
            key,
            value,
            source: 'state'
        })
    }

    await lifecycle.register()

    await lifecycle.load()
    
    await router.push(url)
    
    await lifecycle.boot({
        exclude: [AppLifecycleHook]
    })

    const ctx = {}

    const html = await renderToString(app, ctx)

    return { html }
}
