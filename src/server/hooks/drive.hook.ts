import { config, container, DriveService, logger } from '@sidekick-coder/zenith-kit/server'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

export default class DriveLifecycleHook extends LifecycleHook {
    public order = 3
    public hook_aliases = ['drive']
    public async onRegister(): Promise<void> {
        const service = new DriveService({
            debug: config.get('drive.debug') || config.get('app.debug'),
            logger: logger.child({ label: 'drive' }) 
        })
        
        container.set(DriveService, service)
    }

    public async onLoad(): Promise<void> {
        const drive = container.get<DriveService>(DriveService)

        await drive.load()
    }

    public async onBoot(): Promise<void> {
        
    }
}
