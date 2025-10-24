import fs from 'fs'
import { join } from 'path'
import { basePath } from '#server/utils/paths.ts'
import env from '#server/env.ts'
import Base from '#shared/entities/module.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Module extends composeWith(Base) {
    public makePath(...parts: string[]) {
        return basePath('modules', this.name, ...parts)
    }

    public staticPath(...parts: string[]) {
        return join('/static', 'modules', this.name, 'client', ...parts)
    }

    public load(){
        this.files = []

        if (env.isDevelopment && fs.existsSync(this.makePath('client', 'setup.client.ts'))) {
            this.files.push({
                type: 'setup:client',
                context: 'server',
                src: join('/modules', this.id, 'client', 'setup.client.ts'),
            })

            this.files.push({
                type: 'setup:client',
                context: 'client',
                src: this.staticPath('setup.client.ts'),
            })

            return
        }

        if (fs.existsSync(this.makePath('client', 'setup.client.js'))) {
            this.files.push({
                type: 'setup:client',
                context: 'server',
                src: join('/modules', this.id, 'client', 'setup.client.js'),
            })

            this.files.push({
                type: 'setup:client',
                context: 'client',
                src: this.staticPath('setup.client.js'),
            })
        }
    }
}