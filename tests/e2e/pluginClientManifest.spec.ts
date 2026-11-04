import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import ZenithContainer from '#tests/entities/ZenithContainer.ts'
import ZenithContainerStarted from '#tests/entities/ZenithContainerStarted.ts'
import TestPlugin from '#tests/entities/TestPlugin.ts'

let container: ZenithContainerStarted
let plugin: TestPlugin

interface ManifestEntry {
    file: string
    css?: string[]
}

let manifest = {} as Record<string, ManifestEntry>


async function loadManifest() {
    const filename = path.join(plugin.directory, 'dist', 'client-browser', '.vite', 'manifest.json')

    const text = fs.readFileSync(filename, 'utf8')

    manifest = JSON.parse(text) as Record<string, ManifestEntry>
}

test.beforeAll(async () => {
    test.setTimeout(120_000)

    plugin = TestPlugin.create('assets')

    await plugin.load()

    await loadManifest()

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
        // await plugin.clean()
    }
})

test('loads a plugin browser entry from its manifest', async ({ page }) => {
    const entry = manifest['src/client/index.ts']
    const css = manifest['style.css']

    await page.goto(container.makeURL('/'), { waitUntil: 'networkidle' })

    await expect(
        page.locator(`link[rel="modulepreload"][href="/plugins/assets/vendor/${entry.file}"]`),
    ).toBeAttached()

    await expect(
        page.locator(`link[rel="stylesheet"][href="/plugins/assets/vendor/${css.file}"]`),
    ).toBeAttached()
})
