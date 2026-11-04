import { expect, test } from '@playwright/test'
import ZenithContainer from '#tests/entities/ZenithContainer.ts'
import ZenithContainerStarted from '#tests/entities/ZenithContainerStarted.ts'
import TestPlugin from '#tests/entities/TestPlugin.ts'

let container: ZenithContainerStarted
let plugin: TestPlugin

test.beforeAll(async () => {
    test.setTimeout(120_000)

    plugin = TestPlugin.create('assets')

    await plugin.load()

    const builder = ZenithContainer.create()

    builder.withBindMounts([
        {
            source: plugin.directory,
            target: `/app/data/plugins/${plugin.id}`,
        },
    ])

    builder.config(`plugins.registry.${plugin.id}.enabled`, 'bool:true')

    container = await builder.start()
})

test.afterAll(async () => {
    if (container) {
        await container.stop()
    }

    if (plugin) {
        await plugin.clean()
    }
})

test('loads a plugin browser entry from its manifest', async ({ page }) => {
    await page.goto(container.makeURL('/'), { waitUntil: 'networkidle' })

    await expect(
        page.locator('link[rel="modulepreload"][href="/plugins/assets/vendor/zenith-plugin-starter.mjs"]'),
    ).toBeAttached()
})
