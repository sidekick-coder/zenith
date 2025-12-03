import ModelConfig from '#server/mixins/modelConfig.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'
import Base from '#shared/entities/databaseConnection.entity.ts'

export default class DatabaseConnection extends composeWith(
    Base,
    ModelConfig('database.connections', { readonly: true })
) {
    public static serialize<T>(this: new (...args: any[]) => T, row: any): Promise<T> {
        const instance = new this() as any

        instance.id = row.id
        instance.name = row.name || row.id
        instance.driver = row.driver
        instance.active = row.active

        return instance as any
    }
}