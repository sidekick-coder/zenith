import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { Model } from '#server/mixins/model.mixin.ts'
import BaseOauthAccount from '#shared/entities/oauthAccount.entity.ts'

export default class OauthAccount extends composeWith(
    BaseOauthAccount,
    Model('oauth_accounts')
) {

}
