import fs from 'fs'
import path from 'path'
import rootLogger from '../facades/logger.facade.ts'
import shell from '#server/facades/shell.facade.ts'
import {
    basePath,
    tmpPath
} from '#server/utils/paths.ts'
import config from '#server/facades/config.facade.ts'

export interface InstallOptions {
    id: string
    repository: string
    branch?: string
    key?: string
}

export default class ModuleInstallerService {
    private logger = rootLogger.child({ label: 'installer' })
    private shell = shell

    constructor(
        logger?: typeof rootLogger,
        shellService?: typeof shell
    ) {
        if (logger) {
            this.logger = logger.child({ label: 'installer' })
        }

        if (shellService) {
            this.shell = shellService
        }
    }

    public async install(options: InstallOptions): Promise<void> {
        const { id, repository, branch, key } = options

        const modulesPath = basePath('modules')
        const moduleDir = path.join(modulesPath, id)

        if (fs.existsSync(moduleDir)) {
            throw new Error(`Module '${id}' already exists`)
        }

        const cloneArgs: string[] = ['clone']

        if (branch) {
            cloneArgs.push('--branch', branch)
        }

        cloneArgs.push(repository, moduleDir)

        if (key) {
            const sshKeyPath = tmpPath(`${id}_ssh_key`)

            fs.writeFileSync(sshKeyPath, key, { mode: 0o600 })

            await this.shell.command('git', cloneArgs, {
                cwd: modulesPath,
                env: { GIT_SSH_COMMAND: `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no` }
            })

            fs.rmSync(sshKeyPath, { force: true })
        } else {
            await this.shell.command('git', cloneArgs, {
                cwd: modulesPath,
                env: { GIT_SSH_COMMAND: 'ssh -o StrictHostKeyChecking=no' }
            })
        }

        config.set(`modules.${id}`, {
            enabled: false,
            ssh_key: key,
        })

        const packageJsonPath = path.join(moduleDir, 'package.json')

        if (fs.existsSync(packageJsonPath)) {
            await this.shell.command('npm', ['install'], { cwd: moduleDir })
        }

        this.logger.info(`Module '${id}' installed successfully from git repository '${repository}'`)
    }
}
