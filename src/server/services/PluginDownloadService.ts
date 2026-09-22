import fs from 'fs'
import path from 'path'
import { basePath, tmpPath } from '@sidekick-coder/zenith-kit/server/utils/basePath'
import { GitGateway } from '@sidekick-coder/zenith-kit/server/gateways/GitGateway'
import ShellService from '@sidekick-coder/zenith-kit/server/services/ShellService'
import BaseException from '@sidekick-coder/zenith-kit/shared/exceptions/BaseException'
import ConfigService from '@sidekick-coder/zenith-kit/shared/services/ConfigService'
import LoggerService from '@sidekick-coder/zenith-kit/shared/services/LoggerService'
// import { load as loadYaml } from 'js-yaml'

export interface PluginDownloadServiceOptions {
    logger?: LoggerService
    config?: ConfigService
    debug?: boolean
}

export interface DownloadOptions {
    repository: string
    branch: string
    sshKeyFile?: string
    sshKey?: string
}

export default class PluginDownloadService {
    public static __container_entry_key = 'PluginDownloadService'
    public logger: LoggerService
    public config: ConfigService
    public debug = false
    public shell: ShellService

    constructor(options: PluginDownloadServiceOptions = {}) {
        this.logger = options.logger || new LoggerService()
        this.config = options.config || new ConfigService()
        this.debug = options.debug || false
        this.shell = new ShellService({
            logger: this.logger.child({ label: 'plugin.download.shell' }),
            debug: this.debug
        })

        if (this.debug) {
            this.logger.debug('initialized in debug mode')
        }
    }

    public static create(options: PluginDownloadServiceOptions = {}) {
        return new PluginDownloadService(options)
    }

    private async downloadTmp(item: DownloadOptions) {
        const { repository, branch, sshKeyFile, sshKey } = item

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
            branch: branch,
            sshKeyFile: sshKeyFile,
            sshKey: sshKey,
        })

        await git.fetchAll()

        if (this.debug) {
            this.logger.debug('downloaded plugin to tmp', {
                repository,
                branch,
                dir,
            })
        }

        return dir
    }

    public async download(item: DownloadOptions) {
        const dir = await this.downloadTmp(item)

        const configFilename = path.join(dir, 'zenith.config.yml')

        if (!fs.existsSync(configFilename)) {
            throw new BaseException(`Plugin config file not found in repository: ${configFilename}`)
        }

        const loadYaml = (await import('js-yaml')).load

        const config = await loadYaml(fs.readFileSync(configFilename, 'utf-8')) as any

        if (!config || !config.id) {
            throw new BaseException(`Plugin config file is invalid or missing 'id' field: ${configFilename}`)
        }

        const destination = basePath('plugins', config.id)

        if (fs.existsSync(destination)) {
            throw new BaseException(`Plugin already exists at destination: ${destination}`)
        }

        // move the downloaded plugin to the plugins directory
        fs.cpSync(dir, destination, { recursive: true })
        fs.rmSync(dir, {
            recursive: true,
            force: true
        })

        this.config.set(`plugins.registry.${config.id}`, {
            branch: item.branch || 'main',
            repository: item.repository,
            ssh_key_file: item.sshKeyFile || null,
            ssh_key: item.sshKey || null,
        })

        this.logger.info('plugin downloaded', {
            repository: item.repository,
            destination,
        })
    }
}
