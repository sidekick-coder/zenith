import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import ModelConfig from '#server/mixins/modelConfig.mixin.ts'
import Base from '#shared/entities/driveConfig.entity.ts'
import config from '#server/facades/config.facade.ts'

export default class DriveConfig extends composeWith(
    Base,
    ModelConfig('drive.disks')
) {
    public static serialize<T>(this: new (...args: any[]) => T, row: any): Promise<T> {
        const instance = new this() as DriveConfig

        instance.id = row.id
        instance.name = row.name || row.id
        instance.type = row.type
        instance.config = row.config || {}
        instance.is_default = config.get('drive.default') === row.id

        return instance as any
    }
}
