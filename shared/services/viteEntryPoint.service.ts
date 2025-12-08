import type LoggerService from './logger.service.ts'

export interface LoadOptions {
    config: Record<string, any>;
    container: Record<string, any>;
    logger: LoggerService;
    router: any;
}

export interface RenderOptions {
    url: string;
    cookies: Record<string, string>;
    state: Record<string, any>;
    htmlAttrs?: Record<string, string>;
}

export interface RenderResult {
    html: string;
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
            state: {}
        }
    }
}