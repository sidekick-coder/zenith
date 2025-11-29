import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class File extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public drive: string
    public mimetype: string
    public purpose: string
    public client_name: string
    public filename: string
    public public: boolean

    // dynamic
    public url?: string
    public metas?: Record<string, string | null>

    public isImage(): boolean {
        return this.mimetype.startsWith('image/')
    }
}