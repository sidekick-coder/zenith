import { PluginEntryEntity } from '@sidekick-coder/zenith-kit/server'
import { LoggerService } from '@sidekick-coder/zenith-kit/shared'

export default class PluginLoaderService {
    public static __container_entry_key = 'PluginLoaderService'
    public entries: Map<PluginEntryEntity['id'], PluginEntryEntity>
    public logger: LoggerService
    public debug = false

    public setLogger(logger: LoggerService) {
        this.logger = logger
        return this
    }

    public setDebug(debug: boolean) {
        this.debug = debug
        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }

        return this
    }

    public setEntries(entries: Map<PluginEntryEntity['id'], PluginEntryEntity>) {
        this.entries = entries
        return this
    }

    public async load(): Promise<void> {
        this.logger.warn('load method not implemented yet, skipping plugin loading')
    }

    public async cleanup(): Promise<void> {
        this.logger.warn('cleanup method not implemented yet, skipping plugin cleanup')
    }
}
