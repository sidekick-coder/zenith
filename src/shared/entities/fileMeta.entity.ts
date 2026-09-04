import { compose } from '@sidekick-coder/zenith-kit/shared/utils/compose'
import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'

export default class FileMeta extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public file_id: number
    public name: string
    public value: string | null
}
