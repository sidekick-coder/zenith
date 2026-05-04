import './translator.ts'

import './imports'
import './assets/styles.css'
import '@sidekick-coder/zenith-kit/styles'

import { renderToString } from 'vue/server-renderer'
import type { App } from 'vue'
import { createHead } from '@unhead/vue/server'
import * as VueServerRenderer from 'vue/server-renderer'
import { container } from '@sidekick-coder/zenith-kit/client'
import { ConfigService, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import { RouterService } from '@sidekick-coder/zenith-kit/server'
import lifecycle from './facades/lifecycle.facade.ts'
import ModulesService from './services/modules.service.ts'
import ModulesNodeService from './services/modulesNode.service.ts'
import type { Router } from './router.ts'
import ModulesDevService from './services/modulesDev.service.ts'
import FetchNodeService from './services/fetchNode.service.ts'
import FetchService from './services/fetch.service.ts'
import type EntryNodeRenderContract from '#shared/contracts/EntryNodeRenderContract.ts'
import type { EntryNodeRenderResult } from '#shared/contracts/EntryNodeRenderContract.ts'

if (!globalThis.imports) {
    globalThis.imports = new Map<string, () => Promise<any>>()
}

if (import.meta.env.SSR) {
    globalThis.imports.set('vue/server-renderer', () => Promise.resolve(VueServerRenderer))
}

export default async function(ctx: EntryNodeRenderContract): Promise<EntryNodeRenderResult> {
    const config = new ConfigService()

    config.loadFromRecord(ctx.config)

    container.set(ConfigService, config)
    container.set(LoggerService, ctx.logger)

    const serviceOptions = { debug: config.get('modules.debug') || config.get('app.debug') }

    const modulesService = import.meta.env.PROD ? new ModulesNodeService(serviceOptions) : new ModulesDevService(serviceOptions)

    await modulesService.discover()

    container.set(ModulesService, modulesService)
    container.set(FetchService, new FetchNodeService())
    container.set(RouterService, ctx.serverRouter)

    container.set('state', ctx.state || {})
    container.set('cookies', ctx.cookies)

    await lifecycle.emit(['register', 'load', 'boot'])

    const router = container.get<Router>('router')
    const app = container.get<App>('app')
    const head = createHead({ init: ctx.head  })

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

// export default class EntryNode extends ViteEntryPointService {
//     public load: ViteEntryPointService['load'] = async (options) => {
//         container.set(LoggerService, options.logger)
//         container.set('isServer', true)
//
//         container.loadFromRecord(options.container || {})
//
//         const serviceOptions = { debug: config.get('modules.debug') || config.get('app.debug') }
//
//         const useNodeService = config.get('modules.node.service') === 'node' || import.meta.env.PROD
//
//         const modulesService = useNodeService ? new ModulesNodeService(serviceOptions) : new ModulesDevService(serviceOptions)
//
//         await modulesService.discover()
//
//         container.set(ModulesService, modulesService)
//         container.set(FetchService, new FetchNodeService())
//         container.set(RouterService, options.router)
//
//
//         return { container: { modules: container.get('modules') } }
//     }
//
//     public render: ViteEntryPointService['render'] = async (context) => {
//         config.loadFromRecord(context.config || {})
//         container.set('state', context.state || {})
//         container.set('cookies', context.cookies)
//
//         await lifecycle.emit(['register', 'load', 'boot'])
//
//         const router = container.get<Router>('router')
//         const app = container.get<App>('app')
//         const head = createHead({ init: [context.state.head] })
//
//         app.use(head)
//
//         await router.push(context.url)
//
//         await router.isReady()
//
//         const ctx = {}
//
//         const html = await renderToString(app, ctx)
//
//         return {
//             html,
//             head,
//             state: container.get<Record<string, any>>('state')
//         }
//     }
// }
