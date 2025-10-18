import { BaseEntity } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class Module extends compose(BaseEntity) {
    public id: string
    public name: string
    public enabled: boolean = false
}