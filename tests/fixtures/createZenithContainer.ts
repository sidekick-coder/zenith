import { GenericContainer } from 'testcontainers'

export class ZenithContainer extends GenericContainer {
    private _config: Record<string, string> = {}

    constructor() {
        super('zenith-test')

        this.withExposedPorts(3000)
        this.withHealthCheck({
            test: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
            interval: 1000,
            timeout: 10000,
            retries: 30,
        })

        this.setConfig({
            'database.default': 'sqlite',
            'database.connections.sqlite.dialect': 'sqlite',
            'database.connections.sqlite.database': '/tmp/zenith.db',
            'database.migrator.auto': 'true',

            'users.auto': 'true',
            'users.registry[0].name': 'admin',
            'users.registry[0].username': 'admin',
            'users.registry[0].email': 'admin@admin.com',
            'users.registry[0].password': 'admin-123',
            'users.registry[0].permissions': 'admin',
        })
    }

    public setConfig(config: Record<string, string>) {
        this._config = config

        const env = {
            ZENITH_CONFIG: Object.entries(config)
                .map(([key, value]) => `${key}=${value}`)
                .join(';'),
        }

        this.withEnvironment(env)

        return this
    }

    public config(key: string, value: string) {
        return this.setConfig({
            ...this._config,
            [key]: value
        })
    }
}

export function createZenithContainer() {
    return new ZenithContainer()
}
