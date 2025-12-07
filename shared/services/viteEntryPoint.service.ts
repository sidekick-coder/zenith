import type LoggerService from './logger.service.ts'

export interface LoadOptions {
    config: Record<string, any>;
    logger: LoggerService;
}
export default class ViteEntryPointService {
    public async load(options: LoadOptions) {
        // implementation here
    }
}