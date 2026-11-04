import { PluginEntity, lifecycle } from '@sidekick-coder/zenith-kit/client'
import './assets/styles.css'

export default class extends PluginEntity {
    public async load() {
        lifecycle.on('load', async () => {
            this.addPagesFolder(import.meta.glob('./pages/**/*.vue'), {
                strip: ['pages'],
                prefix: `/admin/assets`,
            })
        })
    }
}
