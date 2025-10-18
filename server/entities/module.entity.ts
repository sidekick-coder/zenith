import { basePath } from '#server/utils/paths.ts'
import Base from '#shared/entities/module.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Module extends composeWith(Base) {
    public makePath(...parts: string[]) {
        return basePath('modules', this.name, ...parts)
    }
}