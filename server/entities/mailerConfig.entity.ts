import ModelConfig from '#server/mixins/modelConfig.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'
import Base from '#shared/entities/mailerConfig.entity.ts'
import config from '#server/facades/config.facade.ts'

export default class MailerConfig extends composeWith(
    Base,
    ModelConfig('mailer.gateways')
) {
    public static serialize<T>(this: new (...args: any[]) => T, row: any): Promise<T> {
        const instance = new this() as MailerConfig

        instance.id = row.id
        instance.name = row.name || row.id
        instance.type = row.type
        instance.config = row.config || {}
        instance.is_default = config.get('mailer.default') === row.id

        return instance as any
    }
}