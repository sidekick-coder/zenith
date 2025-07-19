import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import di from './utils/di'
import { createServerFetcher } from './utils/fetcher'

interface RenderContext {
    url: string;
    router: any;
}

export async function render(context: RenderContext) {
    const url = context.url
    const serverRouter = context.router
    
    const { app, router } = createApp()

    // passing SSR context object which will be available via useSSRContext()
    // @vitejs/plugin-vue injects code into a component's setup() that registers
    // itself on ctx.modules. After the render, ctx.modules would contain all the
    // components that have been instantiated during this render call.
    const ctx = {}

    di.set('fetcher', createServerFetcher(serverRouter))

    await router.push(url)

    await router.isReady()

    const html = await renderToString(app, ctx)

    return { html }
}
