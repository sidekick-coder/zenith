import config from '#server/facades/config.facade.ts'
import di from '#server/facades/di.facade.ts'
import DriveService from '#server/services/drive.service.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class DriveLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const service = new DriveService({
            debug: config.get('drive.debug') || config.get('app.debug'),
        })
        
        di.set(DriveService, service)
    }

    public async onLoad(): Promise<void> {
        const drive = di.get<DriveService>(DriveService)

        await drive.load()
    }

    public async onBoot(): Promise<void> {
        
    }
}