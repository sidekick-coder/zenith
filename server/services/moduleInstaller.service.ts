import fs from 'fs'
import path from 'path'
import unzipper from 'unzipper'
import rootLogger from '../facades/logger.facade.ts'
import shell from '#server/facades/shell.facade.ts'
import {
    basePath,
    tmpPath
} from '#server/utils/paths.ts'

export interface BaseOptions {
    id: string
}

export interface ZipModuleOptions extends BaseOptions {
    filename: string
}

export interface GitModuleOptions extends BaseOptions {
    repository: string
    branch?: string
    key?: string // SSH private key
}

export default class ModuleInstallerService {
    private logger = rootLogger.child({ label: 'installler' })
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


    public async fromZip(options: ZipModuleOptions): Promise<void> {
        const { id, filename } = options

        const modulesPath = basePath('modules')
        const moduleDir = path.join(modulesPath, id)
        const tempDir = tmpPath(id + '_unzipped')

        // Check if module already exists
        if (fs.existsSync(moduleDir)) {
            throw new Error(`Module '${id}' already exists`)
        }

        const directory = await unzipper.Open.file(filename)

        await directory.extract({ path: tempDir })

        let targetDir = tempDir

        // If the zip contains a single root folder, use it
        const entries = fs.readdirSync(tempDir)
        
        if (entries.length === 1) {
            targetDir = path.join(tempDir, entries[0])
        }

        // Copy extracted files to module directory (safer than rename for cross-disk operations)
        fs.cpSync(targetDir, moduleDir, {
            recursive: true
        })

        // Clean up temporary directory
        fs.rmSync(tempDir, {
            recursive: true,
            force: true
        })

        this.logger.info(`Module '${id}' installed successfully from zip`)
    }

    public async fromGit(options: GitModuleOptions): Promise<void> {
        const { id, repository, branch, key } = options

        const modulesPath = basePath('modules')
        const moduleDir = path.join(modulesPath, id)

        // Check if module already exists
        if (fs.existsSync(moduleDir)) {
            throw new Error(`Module '${id}' already exists`)
        }

        const cloneArgs: string[] = ['clone']
        
        if (branch) {
            cloneArgs.push('--branch', branch)
        }

        cloneArgs.push(repository, moduleDir)

        // Handle SSH key authentication if provided
        if (key) {
            // Write SSH key to temporary file
            const sshKeyPath = tmpPath(`${id}_ssh_key`)
            
            fs.writeFileSync(sshKeyPath, key, { mode: 0o600 })
            
            await this.shell.command('git', cloneArgs, {
                cwd: modulesPath,
                silent: false,
                env: {
                    GIT_SSH_COMMAND: `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no`
                }
            })

            // Clean up SSH key
            fs.rmSync(sshKeyPath, { force: true })
        }

        if (!key) {
            await this.shell.command('git', cloneArgs, {
                cwd: modulesPath,
                silent: false
            })
        }

        this.logger.info(`Module '${id}' installed successfully from git repository '${repository}'`)
    }

    public async install(source: string, options: Partial<BaseOptions> = {}): Promise<void> {
        let isGit = false
        let isZip = false

        if (source.startsWith('http://') || source.startsWith('https://')) {
            isGit = true
        }

        if (source.endsWith('.git')) {
            isGit = true
        }

        if (source.endsWith('.zip')) {
            isZip = true
        }
        
        if (isGit) {
            const id = options.id || path.basename(source, '.git')

            return this.fromGit({
                id,
                repository: source
            })
        }

        if (isZip) {
            const id = options.id || path.basename(source, '.zip')

            return this.fromZip({
                id,
                filename: source
            })
        }

        throw new Error('Unsupported module source format')
    }
}