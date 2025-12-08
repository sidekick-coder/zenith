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
import FetchNodeService from './services/fetchNode.service.ts'
import FetchService from './services/fetch.service.ts'
import RouterService from '#server/services/router.service.ts'
import ViteEntryPointService from '#shared/services/viteEntryPoint.service.ts'
import './imports'
import './assets/styles.css'

if (!globalThis.imports) {
    globalThis.imports = {}
}

if (import.meta.env.SSR) {
    globalThis.imports['vue/server-renderer'] = () => import('vue/server-renderer')
}

export async function importDynamicModule(modulePath: string) {
    if (!fs.existsSync(modulePath)) return null

    const fileUrl = pathToFileURL(modulePath).href

    return await import(/* @vite-ignore */ fileUrl + `?t=${Date.now()}`) // bust cache
}

export default class EntryNode extends ViteEntryPointService {
    public load: ViteEntryPointService['load'] = async (options) => {
        di.loadFromRecord(options.container || {})
        config.loadFromRecord(options.config || {})

        const serviceOptions = {
            debug: config.get('modules.debug') || config.get('app.debug')
        }

        const useNodeService = config.get('modules.node.service') === 'node' || import.meta.env.PROD

        di.set(ModulesService, useNodeService
            ? new ModulesNodeService(serviceOptions)
            : new ModulesDevService(serviceOptions)
        )
        
        di.set(FetchService, new FetchNodeService())
        di.set(RouterService, options.router)

        di.set('logger', options.logger)

        di.set('isServer', true)
    }

    public render: ViteEntryPointService['render'] = async (context) => {
        di.set('state', context.state || {})
        di.set('cookies', context.cookies)
        
        await lifecycle.register()
        await lifecycle.load()
        await lifecycle.boot()

        const router = di.get<Router>('router')
        const app = di.get<App>('app')

        await router.push(context.url)

        await router.isReady()


        const ctx = {}

        const html = await renderToString(app, ctx)

        return {
            html,
            state: di.get<Record<string, any>>('state')
        }
    }
}