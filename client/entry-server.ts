import './imports'
import './translator.ts'
import './assets/styles.css'

import { pathToFileURL } from 'url'
import fs from 'fs'
import { renderToString } from 'vue/server-renderer'
import type { App } from 'vue'
import { createHead } from '@unhead/vue/server'
import * as VueServerRenderer from 'vue/server-renderer'
import di from './utils/di'
import lifecycle from './facades/lifecycle.facade.ts'
import ModulesService from './services/modules.service.ts'
import ModulesNodeService from './services/modulesNode.service.ts'
import type { Router } from './router.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import FetchNodeService from './services/fetchNode.service.ts'
import FetchService from './services/fetch.service.ts'
import RouterService from '#server/services/router.service.ts'
import ViteEntryPointService from '#shared/services/viteEntryPoint.service.ts'
import ConfigService from '#shared/services/config.service.ts'


const config = new ConfigService()

di.set(ConfigService, config)

if (!globalThis.imports) {
    globalThis.imports = new Map<string, () => Promise<any>>()
}

if (import.meta.env.SSR) {
    globalThis.imports.set('vue/server-renderer', () => Promise.resolve(VueServerRenderer))
}

export async function importDynamicModule(modulePath: string) {
    if (!fs.existsSync(modulePath)) return null

    const fileUrl = pathToFileURL(modulePath).href

    return await import(/* @vite-ignore */ fileUrl + `?t=${Date.now()}`) // bust cache
}

export default class EntryNode extends ViteEntryPointService {
    public load: ViteEntryPointService['load'] = async (options) => {
        di.loadFromRecord(options.container || {})

        const serviceOptions = { debug: config.get('modules.debug') || config.get('app.debug') }

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
        config.loadFromRecord(context.config || {})
        di.set('state', context.state || {})
        di.set('cookies', context.cookies)
        
        await lifecycle.register()
        await lifecycle.load()
        await lifecycle.boot()

        const router = di.get<Router>('router')
        const app = di.get<App>('app')
        const head = createHead({ init: [context.state.head] })

        app.use(head)

        await router.push(context.url)

        await router.isReady()

        const ctx = {}

        const html = await renderToString(app, ctx)

        return {
            html,
            head,
            state: di.get<Record<string, any>>('state')
        }
    }
}
