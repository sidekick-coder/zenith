import path from 'node:path'
import { emmitter, router, PluginEntity, RouterFileBaseRoutingService } from '@sidekick-coder/zenith-kit/server'

export default class extends PluginEntity {
    public async load() {
        emmitter.on('router:registered', async () => {
            await RouterFileBaseRoutingService
                .create(path.resolve(import.meta.dirname, 'api'))
                .setLogger(this.logger)
                .setModule('basic')
                .setRouter(router)
                .setPrefix('/api/basic')
                .load()
        })
    }
}
