import fs from 'fs'
import path from 'path'
import unzipper from 'unzipper'
import rootLogger from '../facades/logger.facade.ts'
import shell from '#server/facades/shell.facade.ts'
import {
    basePath,
    tmpPath
} from '#server/utils/paths.ts'

export interface BaseUpgradeOptions {
    id: string
}

export interface ZipModuleUpgradeOptions extends BaseUpgradeOptions {
    filename: string
}

export interface GitModuleUpgradeOptions extends BaseUpgradeOptions {
    repository: string
    branch?: string
    key?: string // SSH private key
}

export default class ModuleUpgraderService {
    private logger = rootLogger.child({ label: 'upgrader' })
    private shell = shell

    constructor(
        logger?: typeof rootLogger,
        shellService?: typeof shell
    ) {
        if (logger) {
            this.logger = logger.child({ label: 'upgrader' })
        }

        if (shellService) {
            this.shell = shellService
        }
    }



    public async fromZip(options: ZipModuleUpgradeOptions): Promise<void> {
        const { id, filename } = options

        const modulesPath = basePath('modules')
        const moduleDir = path.join(modulesPath, id)
        const tempDir = tmpPath(`${id}_upgrade_${Date.now()}`)

        if (!fs.existsSync(moduleDir)) {
            throw new Error(`Module '${id}' does not exist`)
        }

        const directory = await unzipper.Open.file(filename)

        await directory.extract({ path: tempDir })

        let targetDir = tempDir

        // If the zip contains a single root folder, use it
        const entries = fs.readdirSync(tempDir)
        
        if (entries.length === 1 && fs.statSync(path.join(tempDir, entries[0])).isDirectory()) {
            targetDir = path.join(tempDir, entries[0])
        }

        // Remove current module
        fs.rmSync(moduleDir, {
            recursive: true,
            force: true
        })

        // Copy extracted files to module directory
        fs.cpSync(targetDir, moduleDir, {
            recursive: true
        })

        // Clean up temporary directory
        fs.rmSync(tempDir, {
            recursive: true,
            force: true
        })

        this.logger.info(`Module '${id}' upgraded successfully from zip`)
    }

    public async fromGit(options: GitModuleUpgradeOptions): Promise<void> {
        const { id, repository, branch, key } = options

        const modulesPath = basePath('modules')
        const moduleDir = path.join(modulesPath, id)
        const gitDir = path.join(moduleDir, '.git')

        if (!fs.existsSync(moduleDir)) {
            throw new Error(`Module '${id}' does not exist`)
        }

        // Initialize git repository if it doesn't exist
        if (!fs.existsSync(gitDir)) {
            await this.shell.command('git', ['init'], {
                cwd: moduleDir,
            })

            await this.shell.command('git', ['remote', 'add', 'origin', repository], {
                cwd: moduleDir,
            })
        }

        // Set up SSH key authentication if provided
        let sshKeyPath: string | null = null
        const gitEnv: Record<string, string> = {}

        if (key) {
            sshKeyPath = tmpPath(`${id}_ssh_key_${Date.now()}`)
            fs.writeFileSync(sshKeyPath, key, { mode: 0o600 })
            gitEnv.GIT_SSH_COMMAND = `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no`
        }

        // Fetch latest changes from remote
        await this.shell.command('git', ['fetch', 'origin'], {
            cwd: moduleDir,
            env: gitEnv
        })

        // Switch to the specified branch or default branch
        if (branch) {
            await this.shell.command('git', ['checkout', branch], {
                cwd: moduleDir,
                env: gitEnv
            })
        }

        // Pull the latest changes
        await this.shell.command('git', ['pull', 'origin', branch || 'main'], {
            cwd: moduleDir,
            env: gitEnv
        })

        // Clean up SSH key if it was created
        if (sshKeyPath) {
            fs.rmSync(sshKeyPath, { force: true })
        }

        this.logger.info(`Module '${id}' upgraded successfully from git repository '${repository}'`)
    }

}