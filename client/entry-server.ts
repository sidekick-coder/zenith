import { pathToFileURL } from 'url'
import fs from 'fs'
import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import di from './utils/di'
import { createServerFetcher } from './utils/fetcher'
import type { Logger } from './utils/logger'
import config from './facades/config.facade'
import lifecycle from './facades/lifecycle.facade.ts'
import RouterLifecycleHook from './hooks/router.hook.ts'
import AppLifecycleHook from './hooks/app.hook.ts'
import AuthLifecycleHook from './hooks/auth.hook.ts'
import app from './facades/app.facade.ts'
import { flatten } from '#shared/utils/flatten.ts'


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

    lifecycle.add(
        RouterLifecycleHook,
        AppLifecycleHook,
        AuthLifecycleHook
    )

    await lifecycle.register()

    await lifecycle.load()

    // await lifecycle.boot()

    // const { app, router } = await createApp()

    // await router.push(url)

    // await router.isReady()

    const ctx = {}

    const html = await renderToString(app, ctx)

    return { html }
}
