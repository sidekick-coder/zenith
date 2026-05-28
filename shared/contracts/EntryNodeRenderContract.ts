// import type { PageRequestContextEntity } from '@sidekick-coder/zenith-kit/server'
import type { LoggerService } from '@sidekick-coder/zenith-kit/shared'
import type { VueHeadClient } from '@unhead/vue'

export interface EntryNodeRenderContract {
    url: string;
    config: Record<string, any>;
    container: Record<string, any>;
    cookies: Record<string, string>;
    state: Record<string, any>;
    logger: LoggerService;
    head: any;
    serverRouter: any
}

export interface EntryNodeRenderResult {
    html: string;
    head: VueHeadClient;
    state: Record<string, any>;
    ssrContext: Record<string, any>;
}

export type EntryNodeRenderFunction = (ctx: EntryNodeRenderContract) => Promise<EntryNodeRenderResult>

