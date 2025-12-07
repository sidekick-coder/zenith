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
import ViteEntryPointService from '#shared/services/viteEntryPoint.service.ts'

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
    
    
    di.set('fetcher', createServerFetcher(serverRouter, context.cookies))
    di.set('state', {})

    const serviceOptions = {
        debug: config.get('modules.debug') || config.get('app.debug')
    }

    const useNodeService = config.get('modules.node.service') === 'node' || import.meta.env.PROD

    di.set(ModulesService, useNodeService
        ? new ModulesNodeService(serviceOptions)
        : new ModulesDevService(serviceOptions)
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

export default class EntryNode extends ViteEntryPointService {
    public load: ViteEntryPointService['load'] = async (options) => {
        config.loadFromRecord(options.config || {})
        di.set('logger', options.logger)
        di.set('isServer', true)
    }
}