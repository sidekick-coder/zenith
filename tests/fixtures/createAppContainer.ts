import { basePath } from '@sidekick-coder/zenith-kit/server'
import { GenericContainer } from 'testcontainers'

export async function createZenithContainer() {
    const container = await GenericContainer.fromDockerfile(basePath()).build()

    const started = await container.start()

    return {
        container: started,
        url: `http://${started.getHost()}:${started.getMappedPort(3000)}`
    }
}
