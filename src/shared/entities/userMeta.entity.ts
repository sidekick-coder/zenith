import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'

export default class UserMeta extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public user_id: number
    public name: string
    public value: string | null
}
