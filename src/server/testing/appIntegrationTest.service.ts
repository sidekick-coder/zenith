import { GenericContainer, Network, Wait } from 'testcontainers'
import type { StartedTestContainer, StartedNetwork } from 'testcontainers'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import DatabasePGIntegrationTestService from './databasePGIntegrationTest.service.ts'
import UserIntegrationTestService from './userIntegrationTest.service.ts'
import { basePath } from '#server/utils/paths.ts'

export default class AppIntegrationTestService {
    public container: StartedTestContainer | null = null
    public network: StartedNetwork | null = null
    public config: Record<string, string> = {
        'setup.database': 'true',
        'setup.user': 'true',
    }
    public dbService: DatabasePGIntegrationTestService | null = null

    public get users() {
        if (!this.container) {
            throw new Error('Container not started')
        }

        return new UserIntegrationTestService(this.container)
    }

    public get url () {
        if (!this.container) {
            throw new Error('Container not started')
        }

        return `http://${this.container.getHost()}:${this.container.getMappedPort(3000)}`
    }

    public withConfig(config: Record<string, string>) {

        for (const [key, value] of Object.entries(config)) {
            this.config[key] = value
        }
        
        return this
    }

    public withPostgresDatabase() {
        this.dbService = new DatabasePGIntegrationTestService()        

        this.config['database.default'] = 'postgresql'
        this.config['database.connections.postgresql.driver'] = 'postgresql'
        this.config['database.connections.postgresql.host'] = this.dbService.networkAlias
        this.config['database.connections.postgresql.port'] = '5432'
        this.config['database.connections.postgresql.database'] = this.dbService.databaseName
        this.config['database.connections.postgresql.user'] = this.dbService.databaseUser
        this.config['database.connections.postgresql.password'] = this.dbService.databasePassword

        return this
    }

    
    private async start() {
        const env = { CONFIG: '' }

        for (const [key, value] of Object.entries(this.config)) {
            env['CONFIG'] += `${key}=${value};`
        }

        let container = await new GenericContainer('node:23')
            .withNetworkAliases('app')
            .withBindMounts([
                { 
                    source: basePath('client'),
                    target: '/app/client',
                    mode: 'ro'
                },
                { 
                    source: basePath('server'),
                    target: '/app/server',
                    mode: 'ro'
                },
                { 
                    source: basePath('docker'),
                    target: '/app/docker',
                    mode: 'ro'
                },
                { 
                    source: basePath('langs'),
                    target: '/app/langs',
                    mode: 'ro'
                },
                { 
                    source: basePath('modules'),
                    target: '/app/modules',
                    mode: 'ro'
                },
                { 
                    source: basePath('node_modules'),
                    target: '/app/node_modules',
                    // mode: 'ro'
                },
                { 
                    source: basePath('shared'),
                    target: '/app/shared',
                    mode: 'ro'
                },
                { 
                    source: basePath('arte'),
                    target: '/app/arte',
                    mode: 'ro'
                },
                { 
                    source: basePath('arte.ts'),
                    target: '/app/arte.ts',
                    mode: 'ro'
                },
                { 
                    source: basePath('components.json'),
                    target: '/app/components.json',
                    mode: 'ro'
                },
                { 
                    source: basePath('index.ts'),
                    target: '/app/index.ts',
                    mode: 'ro'
                },
                { 
                    source: basePath('package.json'),
                    target: '/app/package.json',
                    mode: 'ro'
                },
                { 
                    source: basePath('package-lock.json'),
                    target: '/app/package-lock.json',
                    mode: 'ro'
                },
                { 
                    source: basePath('tsconfig.client.json'),
                    target: '/app/tsconfig.client.json',
                    mode: 'ro'
                },
                { 
                    source: basePath('tsconfig.json'),
                    target: '/app/tsconfig.json',
                    mode: 'ro'
                },
                { 
                    source: basePath('tsconfig.server.json'),
                    target: '/app/tsconfig.server.json',
                    mode: 'ro'
                },
                { 
                    source: basePath('tsconfig.shared.json'),
                    target: '/app/tsconfig.shared.json',
                    mode: 'ro'
                },
                { 
                    source: basePath('vite.config.ts'),
                    target: '/app/vite.config.ts',
                    mode: 'ro'
                },
            ])
            .withWorkingDir('/app')
            .withTmpFs({ 
                '/app/storage': 'rw',
                '/app/node_modules/.vite': 'rw',
                '/app/storage/config': 'rw',
                '/app/logs': 'rw',
            })
            .withEnvironment(env)
            .withExposedPorts(3000)
            .withCommand(['node', 'arte', 'serve'])
            .withWaitStrategy(Wait.forHttp('/api/health', 3000).forStatusCode(200))

        if (this.network) {
            container = container.withNetwork(this.network)
        }

        this.container = await container.start()
    }

    
    private async boot() {
        this.network = await new Network().start()

        if (this.dbService) {
            this.dbService.withNetwork(this.network)
        }
    }

    public async command(command: string[]) {
        if (!this.container) {
            throw new Error('Container not started')
        }

        const execResult = await this.container.exec(command)

        if (execResult.exitCode !== 0) {
            throw new Error(`Command failed: ${command.join(' ')}\n${execResult.output}`)
        }

        const result = {
            code: execResult.exitCode,
            output: execResult.output,
            stderr: execResult.stderr,
            stdout: execResult.stdout,
            json: null as any
        }

        if (command.includes('--json')) {
            const [, json] = tryCatch.sync(() => JSON.parse(execResult.output))

            if (json) {
                result.json = json
            }
        }

        return result
    }

    public async migrate() {
        return this.command(['node', 'arte', 'migration:latest', '--root'])
    }

    public async rollback() {
        return this.command(['node', 'arte', 'migration:rollback', '--root'])
    }

    public async up() {
        await this.boot()

        if (this.dbService) {
            await this.dbService.up()
        }

        await this.start()
    }

    public async down() {
        if (this.container) {
            await this.container.stop()
            
            this.container = null
        }

        if (this.dbService) {
            await this.dbService.down()

            this.dbService = null
        }

        if (this.network) {
            await this.network.stop()

            this.network = null
        }
    }

    public async restart() {
        if (!this.container) {
            throw new Error('Container not started')
        }

        await this.container.restart()
    }
}
