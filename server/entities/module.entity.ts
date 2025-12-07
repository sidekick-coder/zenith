import fs from 'fs'
import { join } from 'path'
import { basePath } from '#server/utils/paths.ts'
import Base from '#shared/entities/module.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Module extends composeWith(Base) {
    public makePath(...parts: string[]) {
        return basePath('modules', this.name, ...parts)
    }

    public staticPath(...parts: string[]) {
        return join('/static', 'modules', this.name, ...parts)
    }

    public load(){
        const manifestPath = this.makePath('module.json')

        if (!fs.existsSync(manifestPath)) {
            return
        }

        const content = fs.readFileSync(manifestPath, 'utf-8')
        const json = JSON.parse(content)

        this.dependencies = json.dependencies || {}        
    }
}