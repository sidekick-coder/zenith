import { afterAll, it, beforeAll, describe, expect } from 'vitest'
import ZenithContainer from '../entities/ZenithContainer.ts'
import ZenithContainerStarted from '../entities/ZenithContainerStarted.ts'
import TestPlugin from '#tests/entities/TestPlugin.ts'

describe('plugin api routes', () => {

    let container: ZenithContainerStarted
    let plugin: TestPlugin

    async function createContainer() {
        const builder = ZenithContainer.create()

        // builder.withPrintLogs()

        // plugin volume mount
        builder.withBindMounts([
            {
                source: plugin.directory,
                target: '/app/data/plugins/' + plugin.id,
            },
        ])

        builder.config(`plugins.registry.${plugin.id}.enabled`, 'bool:true')

        container = await builder.start()
    }

    async function createPlugin() {
        plugin = TestPlugin.create()

        await plugin.load()
    }

    beforeAll(async () => {
        await createPlugin()
        await createContainer()
    })

    afterAll(async () => {
        if (container) {
            await container.stop()
        }

        if (plugin) {
            await plugin.clean()
        }
    })

    it('should load plugin api routes', async () => {
        const response = await fetch(container.makeURL('/api/basic/message'))

        const data = await response.json()

        expect(data).toEqual({ message: 'Hello World!' })
    })
})
