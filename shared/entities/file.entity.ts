import { createBaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

const BaseEntity = createBaseEntity({
    parse(data: any) {
        if (typeof data.metadata === 'string') {
            data.metadata = JSON.parse(data.metadata)
        }

        return data
    }
})

export default class File extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public drive: string
    public mimetype: string
    public client_name: string
    public filename: string
    public metadata?: Record<string, any>

    // dynamic
    public url?: string

    public isImage(): boolean {
        return this.mimetype.startsWith('image/')
    }
}