import ModelConfig from '#server/mixins/modelConfig.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'
import Base from '#shared/entities/driveConfig.entity.ts'

export default class DriveConfig extends composeWith(
    Base,
    ModelConfig('drive.disks')
) {
    public static serialize<T>(this: new (...args: any[]) => T, row: any): Promise<T> {
        const instance = new this() as any

        instance.id = row.id
        instance.name = row.name || row.id
        instance.driver = row.driver

        return instance as any
    }
}