import { BaseEntity } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

interface ModuleFile {
    type: 'setup:client' | 'setup:server' | 'asset'
    context?: 'server' | 'client'
    src: string
}

export default class Module extends compose(BaseEntity) {
    public id: string
    public name: string
    public enabled: boolean = false
    public files: ModuleFile[] = []
    public dependencies: Record<string, any> = {}
}