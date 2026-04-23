import fs from 'fs'
import { join } from 'path'
import { GitGateway } from '@sidekick-coder/zenith-kit/server'
import { basePath, tmpPath } from '#server/utils/paths.ts'
import Base from '#shared/entities/module.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'
import shell from '#server/facades/shell.facade.ts'
import config from '#server/facades/config.facade.ts'
import logger from '#server/facades/logger.facade.ts'

export default class Module extends composeWith(Base) {

    public get directory() {
        return this.makePath()
    }

    public get git(){
        return new GitGateway({
            cwd: this.directory,
            sshKey: config.get(`modules.${this.id}.ssh_key`),
            sshKeyTmpFileName: tmpPath(`ssh_key_${this.id}.pem`),
            logger: logger.child({ label: 'git' }),
            debug: config.get('git.debug', false),
        })
    }

    public makePath(...parts: string[]) {
        return basePath('modules', this.id, ...parts)
    }

    public staticPath(...parts: string[]) {
        return join('/static', 'modules', this.id, ...parts)
    }

    public command: typeof shell.command = (bin, args, options) => {
        return shell.command(bin, args, {
            cwd: this.directory,
            ...options,
        })
    }

    public load(){
        const manifestPath = this.makePath('module.json')

        if (!fs.existsSync(manifestPath)) {
            return
        }

        const content = fs.readFileSync(manifestPath, 'utf-8')
        const json = JSON.parse(content)

        this.dependencies = json.dependencies || {}
        this.build = json.build || {}      
    }
}
