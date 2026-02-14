import { GenericContainer, Wait } from 'testcontainers'
import type { StartedTestContainer, StartedNetwork } from 'testcontainers'

export default class DatabasePGIntegrationTestService {
    public container: StartedTestContainer | null = null
    public network: StartedNetwork | null = null
    public networkAlias: string = 'postgres'
    public databaseName: string = 'zenith_test'
    public databaseUser: string = 'zenith'
    public databasePassword: string = 'zenith' 

    public get host() {
        if (!this.container) {
            throw new Error('Container not started')
        }

        return this.container.getHost()
    }

    public get port() {
        if (!this.container) {
            throw new Error('Container not started')
        }

        return this.container.getMappedPort(5432)
    }

    public withNetwork(network: StartedNetwork, alias: string = 'postgres') {
        this.network = network
        this.networkAlias = alias

        return this
    }
    
    public async up() {        
        let container = new GenericContainer('postgres:17-alpine')
            .withEnvironment({
                POSTGRES_DB: this.databaseName,
                POSTGRES_USER: this.databaseUser,
                POSTGRES_PASSWORD: this.databasePassword,
            })
            .withExposedPorts(5432)
            .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/))

        if (this.network) {
            container = container
                .withNetwork(this.network)
                .withNetworkAliases(this.networkAlias)
        }

        this.container = await container.start()
    }

    public async down() {
        if (this.container) {
            await this.container.stop()
            
            this.container = null
        }
    }
}