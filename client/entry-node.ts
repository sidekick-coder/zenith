import './translator.ts'

import './imports'
import './assets/styles.css'

import { renderToString } from 'vue/server-renderer'
import type { App } from 'vue'
import { createHead } from '@unhead/vue/server'
import * as VueServerRenderer from 'vue/server-renderer'
import { container, LifecycleService, FetchService, FetchNodeService } from '@sidekick-coder/zenith-kit/client'
import { ConfigService, EmmitterService, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import ModulesService from './services/modules.service.ts'
import ModulesNodeService from './services/modulesNode.service.ts'
import type { Router } from './router.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import type { EntryNodeRenderContract, EntryNodeRenderResult } from '#shared/contracts/EntryNodeRenderContract.ts'

if (!globalThis.imports) {
    globalThis.imports = new Map<string, () => Promise<any>>()
}

globalThis.imports.set('vue/server-renderer', () => Promise.resolve(VueServerRenderer))

export default async function(ctx: EntryNodeRenderContract): Promise<EntryNodeRenderResult> {
    const config = new ConfigService()
    const logger = ctx.logger

    config.loadFromRecord(ctx.config)
    container.loadFromRecord(ctx.container)

    container.set(ConfigService, config)
    container.set(LoggerService, ctx.logger)

    // emmitter
    const emmiter = new EmmitterService({
        debug: config.getOne(['emmitter.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'emmitter' }),
    })

    const lifecycle = new LifecycleService({
        debug: config.getOne(['lifecycle.debug', 'app.debug', 'debug'], false),
        logger: logger.child({ label: 'lifecycle' }),
    })

    lifecycle.addImports(import.meta.glob('./hooks/*.ts', { eager: true }))

    const serviceOptions = { debug: config.get('modules.debug') || config.get('app.debug') }

    const modulesService = import.meta.env.PROD ? new ModulesNodeService(serviceOptions) : new ModulesDevService(serviceOptions)

    await modulesService.discover()

    container.set(ModulesService, modulesService)
    container.set(FetchService, new FetchNodeService())
    container.set('RouterService', ctx.serverRouter)
    container.set(EmmitterService, emmiter)

    container.set('state', ctx.state || {})
    container.set('cookies', ctx.cookies)

    await lifecycle.emit(['register', 'load', 'boot'])

    const router = container.get<Router>('router')
    const app = container.get<App>('app')
    const head = createHead({ init: ctx.head })

    app.use(head)

    await router.push(ctx.url)

    await router.isReady()

    const ssrContext = {}

    const html = await renderToString(app, ssrContext)

    return {
        html,
        head,
        state: container.get<Record<string, any>>('state'),
        ssrContext
    }
}
