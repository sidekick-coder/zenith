import { pathToFileURL } from 'url'
import fs from 'fs'
import { renderToString } from 'vue/server-renderer'
import type { App } from 'vue'
import di from './utils/di'
import { createServerFetcher } from './utils/fetcher'
import type { Logger } from './utils/logger'
import config from './facades/config.facade'
import lifecycle from './facades/lifecycle.facade.ts'
import AppLifecycleHook from './hooks/app.hook.ts'
import ModulesService from './services/modules.service.ts'
import ModulesNodeService from './services/modulesNode.service.ts'
import type { Router } from './router.ts'
import logger from './facades/logger.facade.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import type LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import './imports'
import './assets/styles.css'

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
    logger: Logger
    container: Record<string, any>;
    config: Record<string, any>;
}


export async function importDynamicModule(modulePath: string) {
    if (!fs.existsSync(modulePath)) return null

    const fileUrl = pathToFileURL(modulePath).href

    return await import(/* @vite-ignore */ fileUrl + `?t=${Date.now()}`) // bust cache
}


export async function render(context: RenderContext) {
    const url = context.url
    const serverRouter = context.router

    di.loadFromRecord(context.container)
    config.loadFromRecord(context.config || {})
    
    di.set('fetcher', createServerFetcher(serverRouter, context.cookies))
    di.set('logger', context.logger)
    di.set('isServer', true)
    di.set('state', {})

    const serviceOptions = {
        debug: config.get('modules.debug') || config.get('app.debug')
    }

    di.set(ModulesService, import.meta.env.DEV 
        ? new ModulesDevService(serviceOptions) 
        : new ModulesNodeService(serviceOptions)
    )

    await lifecycle.register()

    await lifecycle.load()

    const router = di.get<Router>('router')
    const app = di.get<App>('app')
    
    await router.push(url)
    
    await lifecycle.boot({
        exclude: [AppLifecycleHook]
    })

    app.config.errorHandler = function (err, vm, info) {
        logger.error(info, err)
    }

    const ctx = {}

    const html = await renderToString(app, ctx)

    context.container.state = di.get<Record<string, any>>('state')
        
    return { 
        html,
    }
}
