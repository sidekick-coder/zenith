import { Model } from '#server/mixins/model.mixin.ts'
import BaseOauthToken from '#shared/entities/oauthToken.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class OauthToken extends composeWith(
    BaseOauthToken,
    Model('oauth_tokens')
) {

}
