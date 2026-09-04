import { randomBytes } from 'crypto'
import { Model } from '#server/mixins/model.mixin.ts'
import normalizers from '#server/normalizers/index.ts'
import BaseOauthToken from '#shared/entities/oauthToken.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import { HooksStatic } from '#server/mixins/hooks.mixin.ts'

interface GenerateTokenOptions {
    provider: string
    action: string
    user_id?: number
    metadata?: Record<string, any>
}

export default class OauthToken extends composeWith(
    BaseOauthToken,
    HooksStatic,
    Model('oauth_tokens')
) {
    public static serialize<T>(this: new (...args: any[]) => T, row: any): Promise<T> {
        const instance = new this() as any

        Object.assign(instance, row)

        if (row.metadata && typeof row.metadata === 'string') {
            instance.metadata = JSON.parse(row.metadata)
        }

        return instance as any
    }

    public static async generate(options: GenerateTokenOptions): Promise<OauthToken> {
        const { provider, action, user_id, metadata } = options 

        const token = randomBytes(32).toString('hex')

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        return await this.create({
            provider,
            action,
            token,
            user_id,
            expires_at: normalizers.datetime.toDb(expiresAt) as string,
            metadata: JSON.stringify(metadata)
        })
    }

}
