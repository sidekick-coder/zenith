import { BaseEntity } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class ModuleManifest extends compose(BaseEntity) {
    public id: string
    public name: string
    public version: string
    public description?: string
    public enabled: boolean
    public author?: string
    public dependencies?: Record<string, string>
}