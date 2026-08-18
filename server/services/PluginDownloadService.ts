import fs from 'fs'
import path from 'path'
import { basePath, EnvService, GitGateway, ShellService, tmpPath } from '@sidekick-coder/zenith-kit/server'
import { BaseException, ConfigService, LoggerService } from '@sidekick-coder/zenith-kit/shared'
import { load as loadYaml } from 'js-yaml'

export interface PluginDownloadServiceOptions {
    logger?: LoggerService
    env?: EnvService
    debug?: boolean
    config?: ConfigService
}

export interface DownloadOptions {
    repository: string
    destination: string
    ssh_key_file?: string
    ssh_key?: string
}

export default class PluginDownloadService {
    public static __container_entry_key = 'PluginDownloadService'
    public logger: LoggerService
    public debug = false
    public shell: ShellService

    constructor(options: { logger?: LoggerService, debug?: boolean } = {}) {
        this.logger = options.logger || new LoggerService()
        this.debug = options.debug || false
        this.shell = new ShellService({
            logger: this.logger.child({ label: 'plugin.download.shell' }),
            debug: this.debug
        })

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public static create(options: { logger?: LoggerService, debug?: boolean } = {}) {
        return new PluginDownloadService(options)
    }

    private async downloadTmp(item: DownloadOptions) {
        const repository = item.repository
        const sshKeyFile = item.ssh_key_file
        const sshKey = item.ssh_key

        if (!repository) {
            throw new BaseException('repository is required for plugin download')
        }

        const hash = Buffer.from(repository)
            .toString('base64')
            .replace(/=/g, '')

        const dir = tmpPath('plugins', hash)

        const exists = fs.existsSync(dir)

        if (exists && this.debug) {
            this.logger.debug('plugin tmp destination already exists, skipping download', item)
        }

        if (exists) {
            return dir
        }

        const git = await GitGateway.clone(repository, dir, {
            logger: this.logger.child({ label: 'plugin.git' }),
            shell: this.shell,
            debug: this.debug,
            sshKeyFile: sshKeyFile,
            sshKey: sshKey,
        })

        await git.fetchAll()

        this.logger.info('downloaded plugin to tmp', {
            repository,
            dir,
        })

        return dir
    }

    public async download(item: DownloadOptions) {
        const dir = await this.downloadTmp(item)

        const configFilename = path.join(dir, 'zenith.config.yml')

        if (!fs.existsSync(configFilename)) {
            throw new BaseException(`Plugin config file not found in repository: ${configFilename}`)
        }

        const config = await loadYaml(fs.readFileSync(configFilename, 'utf-8')) as any

        if (!config || !config.id) {
            throw new BaseException(`Plugin config file is invalid or missing 'id' field: ${configFilename}`)
        }

        const destination = basePath('plugins', config.id)

        if (fs.existsSync(destination)) {
            throw new BaseException(`Plugin already exists at destination: ${destination}`)
        }

        // copy the downloaded plugin to the destination
        fs.cpSync(dir, destination, { recursive: true })

        this.logger.info('plugin downloaded', {
            repository: item.repository,
            destination,
        })
    }
}
