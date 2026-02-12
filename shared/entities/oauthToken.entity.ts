import { BaseEntity } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class OauthToken extends compose(BaseEntity) {  
    public id: number
    public user_id: number | null
    public provider: string | null
    public action: string
    public token: string
    public metadata: Record<string, any>
    public expires_at: string
}
