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
        return join('/static', 'modules', this.name, ...parts)
    }

    public loadFilesDevMode(){
        if (fs.existsSync(this.makePath('client/setup.client.ts'))) {
            this.files.push({
                type: 'setup:client',
                context: 'server',
                src: join('/modules', this.id, 'client/setup.client.ts'),
            })

            this.files.push({
                type: 'setup:client',
                context: 'client',
                src: this.staticPath('client/setup.client.ts'),
            })
        }
    }

    public loadFileProdMode(){
        if (fs.existsSync(this.makePath('server/setup.server.ts'))) {
            this.files.push({
                type: 'setup:server',
                src: this.makePath('server/setup.server.ts'),
            })
        }

        if (fs.existsSync(this.makePath('dist/client/setup.client.js'))) {
            this.files.push({
                type: 'setup:client',
                context: 'client',
                src: this.staticPath('dist/client/setup.client.js'),
            })

            this.files.push({
                type: 'setup:client',
                context: 'server',
                src: this.makePath('dist/server/setup.client.js'),
            })
        }
    }

    public load(){
        this.files = []

        this.loadFileProdMode()

        // if (env.isDevelopment) {
        //     this.loadFileDevMode()
        // }

        // if (env.isProduction) {
        //     this.loadFileProdMode()
        // }
       
    }
}