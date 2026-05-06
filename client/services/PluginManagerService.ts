import { BaseException, LoggerService } from '@sidekick-coder/zenith-kit/shared'

export interface PluginManagerServiceOptions {
    logger?: LoggerService
    debug?: boolean
}

export default class PluginManagerService {
    public static __container_entry_key = 'PluginManagerService'
    public logger: LoggerService
    public debug = false

    constructor(options: PluginManagerServiceOptions) {
        this.logger = options.logger || new LoggerService()
        this.debug = options.debug || false

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public async register() {
        throw new BaseException('Plugin registration not implemented yet')
    }

    public async load(): Promise<void> {
        throw new BaseException('Plugin loading not implemented yet')
    }

}

