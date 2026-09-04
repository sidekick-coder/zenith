import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { BaseEntity, SoftDelete, Timestamp } from '../mixins/index.ts'

export default class Role extends compose(BaseEntity, Timestamp, SoftDelete) {
    public id: number
    public name: string
    public description?: string
}
