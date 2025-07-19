import { renderToString } from 'vue/server-renderer'
import { createApp } from './main'
import di from './utils/di'
import { createServerFetcher } from './utils/fetcher'

interface RenderContext {
    url: string;
    router: any;
    state: Record<string, any>;
}

export async function render(context: RenderContext) {
    const url = context.url
    const serverRouter = context.router

    di.load(context.state)
    
    di.set('fetcher', createServerFetcher(serverRouter))

    const {app, router} = createApp()

    await router.push(url)

    await router.isReady()

    const ctx = {}

    const html = await renderToString(app, ctx)

    return {
        html,
        router,
        hello: 'world',
    }
}
