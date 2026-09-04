import './imports'
import { renderToString } from 'vue/server-renderer'
import { createHead } from '@unhead/vue/server'
import * as VueServerRenderer from 'vue/server-renderer'
import type { EntryNodeRenderContract, EntryNodeRenderResult } from '#shared/contracts/EntryNodeRenderContract.ts'

if (!globalThis.imports) {
    globalThis.imports = new Map<string, () => Promise<any>>()
}

globalThis.imports.set('vue/server-renderer', () => Promise.resolve(VueServerRenderer))

export default async function(ctx: EntryNodeRenderContract): Promise<EntryNodeRenderResult> {
    const { container, FetchService, FetchNodeService } = await import('@sidekick-coder/zenith-kit/client')
    const { createApp } = await import('./app.ts')

    container.set(FetchService, new FetchNodeService())
    container.set('RouterService', ctx.serverRouter)
    container.set('state', ctx.state || {})
    container.set('cookies', ctx.cookies)

    const { app, router } = await createApp({
        logger: ctx.logger,
        configEntries: ctx.config,
        containerEntries: ctx.container,
    })

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
