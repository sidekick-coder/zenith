import { AbstractStartedContainer } from 'testcontainers'
import type { StartedTestContainer } from 'testcontainers'

export default class ZenithContainerStarted extends AbstractStartedContainer {
    constructor(container: StartedTestContainer) {
        super(container)
    }

    public getUrl() {
        return `http://${this.getHost()}:${this.getMappedPort(3000)}`
    }

    public makeURL(...args: string[]) {
        const u = new URL(this.getUrl())

        u.pathname = args.join('/')

        return u.toString()
    }

}
