import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'

export default class OauthAccount extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public user_id: number
    public provider: string
    public provider_user_id: string
    public provider_user_email: string | null
}
