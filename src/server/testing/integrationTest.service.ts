import { GenericContainer, Network, Wait } from 'testcontainers'
import type { StartedNetwork, StartedTestContainer } from 'testcontainers'
import { basePath } from '@sidekick-coder/zenith-kit/server/utils/basePath'

interface PostgresqlContainerConfig {
    database?: string
    user?: string
    password?: string
}

interface AppContainerConfig {
    image?: string
    env?: Record<string, string>
}

export default class IntegrationTestService {
    public network: StartedNetwork | null = null
    public postgresqlContainer: StartedTestContainer | null = null
    public appContainer: StartedTestContainer | null = null

    public async boot() {
        this.network = await new Network().start()
    }

    public async startPostgresql(config?: PostgresqlContainerConfig) {
        if (!this.network) {
            await this.boot()
        }

        const database = config?.database || 'zenith_test'
        const user = config?.user || 'zenith'
        const password = config?.password || 'zenith'

        const container = await new GenericContainer('postgres:16-alpine')
            .withNetwork(this.network!)
            .withNetworkAliases('postgres')
            .withEnvironment({
                POSTGRES_DB: database,
                POSTGRES_USER: user,
                POSTGRES_PASSWORD: password,
            })
            .withExposedPorts(5432)
            .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/))
            .start()

        this.postgresqlContainer = container

        return {
            container,
            host: container.getHost(),
            port: container.getMappedPort(5432),
            database,
            user,
            password,
            connectionString: `postgresql://${user}:${password}@${container.getHost()}:${container.getMappedPort(5432)}/${database}`,
        }
    }

    public async up(config?: AppContainerConfig) {
        await this.boot()
        await this.startPostgresql()

        const container = await new GenericContainer('node:23')
            .withNetwork(this.network!)
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
            .withEnvironment({
                CONFIG: [
                    'database.default=postgresql',
                    'database.connections.postgresql.driver=postgresql',
                    'database.connections.postgresql.host=postgres',
                    'database.connections.postgresql.port=5432',
                    'database.connections.postgresql.database=zenith_test',
                    'database.connections.postgresql.user=zenith',
                    'database.connections.postgresql.password=zenith',
                ].join(';'),
                ...config?.env,
            })
            .withExposedPorts(3000)
            .withCommand(['node', 'arte', 'serve'])
            .withWaitStrategy(Wait.forHttp('/api/health', 3000).forStatusCode(200))
            .start()

        this.appContainer = container

        return {
            container,
            host: container.getHost(),
            port: container.getMappedPort(3000),
            baseUrl: `http://${container.getHost()}:${container.getMappedPort(3000)}`,
        }
    }

    public async down() {
        if (this.appContainer) {
            await this.appContainer.stop()
            
            this.appContainer = null
        }

        if (this.postgresqlContainer) {
            await this.postgresqlContainer.stop()

            this.postgresqlContainer = null
        }

        if (this.network) {
            await this.network.stop()

            this.network = null
        }
    }
}