import path from 'path'
import os from 'os'
import { test, expect, Page } from '@playwright/test'
import { GenericContainer, StartedTestContainer } from 'testcontainers'

let url: string
let container: StartedTestContainer

async function createApp() {
    const volumeId = Date.now().toString()
    const volumePath = path.resolve(os.tmpdir(), `zenith-test-volumes-${volumeId}`)

    const config = {
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
    }

    const env = {
        ZENITH_CONFIG: Object.entries(config)
            .map(([key, value]) => `${key}=${value}`)
            .join(';'),
    }

    const builder = new GenericContainer('zenith-test')
        .withExposedPorts(3000)
        .withEnvironment(env)
        .withBindMounts([
            {
                source: path.join(volumePath, 'tmp'),
                target: '/tmp',
                mode: 'rw',
            },
            {
                source: path.join(volumePath, 'plugins'),
                target: '/app/plugins',
                mode: 'rw',
            }

        ])
        .withHealthCheck({
            test: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
            interval: 1000,
            timeout: 1000,
            retries: 30,
        })

    container = await builder.start()

    url = `http://${container.getHost()}:${container.getMappedPort(3000)}`
}

function baseURL(...args: string[]) {
    const u = new URL(url)

    u.pathname = args.join('/')

    return u.toString()
}

test.beforeAll(async () => {
    test.setTimeout(120000) // Increase timeout for container startup

    await createApp()
})

test.afterAll(async () => {
    if (container) {
        await container.stop()
    }
})


async function goToInstallPage(page: Page) {
    const isLoggedIn = await page.evaluate(() => {
        // @ts-expect-error evaluate window.__INITIAL_STATE__
        const state = window.__INITIAL_STATE__

        if (!state) return false

        return !!state['auth:user']
    })

    if (!isLoggedIn) {
        await page.goto(baseURL('/auth/login'))

        // login
        await page.fill('input[name="uuid"]', 'admin')
        await page.fill('input[name="password"]', 'admin-123')
        await page.click('button[type="submit"]')

        await page.waitForURL(baseURL('/'))
    }


    await page.goto(baseURL('/admin/plugins'))

    await page.click('a:has-text("Install")')

    await expect(page).toHaveURL(/.*\/admin\/plugins\/install/)
}

test('should install a plugin with ssh key on binded volume', async ({ page }) => {

    const identity = process.env.ZENITH_TEST_PLUGIN_IDENTITY || ''
    const repository = process.env.ZENITH_TEST_PLUGIN_REPO || ''
    const sshKey = process.env.ZENITH_TEST_PLUGIN_SSH_KEY || ''

    if (!identity || !repository || !sshKey) {
        test.skip(true, 'Environment variables ZENITH_TEST_PLUGIN_IDENTITY, ZENITH_TEST_PLUGIN_REPO, and ZENITH_TEST_PLUGIN_SSH_KEY must be set for this test.')
        return
    }

    await goToInstallPage(page)

    await page.fill('input[name="repository"]', repository)
    await page.fill('textarea[name="ssh_key"]', sshKey + '\n') // Add a newline to ensure the key is properly formatted
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/.*\/admin\/plugins/)


    await page.waitForSelector(`text=${identity}`)
})
