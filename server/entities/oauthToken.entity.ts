import { randomBytes } from 'crypto'
import { Model } from '#server/mixins/model.mixin.ts'
import normalizers from '#server/normalizers/index.ts'
import BaseOauthToken from '#shared/entities/oauthToken.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class OauthToken extends composeWith(
    BaseOauthToken,
    Model('oauth_tokens')
) {

    public static async generate(provider: string, action: string): Promise<OauthToken> {
        const token = randomBytes(32).toString('hex')

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        return await this.create({
            provider,
            action,
            token,
            expires_at: normalizers.datetime.toDb(expiresAt),
        })
    }

}
