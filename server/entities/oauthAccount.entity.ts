import { Model } from '#server/mixins/model.mixin.ts'
import BaseOauthAccount from '#shared/entities/oauthAccount.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class OauthAccount extends composeWith(
    BaseOauthAccount,
    Model('oauth_accounts')
) {

}
