import type LoggerService from './logger.service.ts'

export interface LoadOptions {
    container: Record<string, any>;
    logger: LoggerService;
    router: any;
}

export interface RenderOptions {
    url: string;
    config: Record<string, any>;
    cookies: Record<string, string>;
    state: Record<string, any>;
}

export interface RenderResult {
    html: string;
    head: any;
    state: Record<string, any>;
}

export default class ViteEntryPointService {
    public async load(options: LoadOptions) {
        // implementation here
    }

    public async render(context: RenderOptions): Promise<RenderResult> {
        // implementation here
        return {
            html: '',
            head: null,
            state: {}
        }
    }
}