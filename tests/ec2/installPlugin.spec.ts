import path from 'path'
import os from 'os'
import { test, expect, Page } from '@playwright/test'
import { StartedTestContainer } from 'testcontainers'
import { createZenithContainer } from '../fixtures/createZenithContainer.ts'

let url: string
let container: StartedTestContainer

interface CreateAppOptions {
    build?: (builder: ReturnType<typeof createZenithContainer>) => void
}

async function createApp(options?: CreateAppOptions) {
    const builder = createZenithContainer()

    if (options?.build) {
        options.build(builder)
    }

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

test.beforeEach(async () => {
    test.setTimeout(120000) // Increase timeout for each test
})

async function goToInstallPage(page: Page) {
    const isLoggedIn = await page.evaluate(() => {
        // @ts-expect-error evaluate window.__INITIAL_STATE__
        const state = window.__INITIAL_STATE__

        if (!state) return false

        return !!state['auth:user']
    })

    if (!isLoggedIn) {
        await page.goto(baseURL('/auth/login'), { waitUntil: 'networkidle' })

        // login
        await page.fill('input[name="uuid"]', 'admin')
        await page.fill('input[name="password"]', 'admin-123')
        await page.click('button[type="submit"]')

        await page.waitForLoadState('networkidle')
        await page.waitForURL(baseURL('/'))
    }


    await page.goto(baseURL('/admin/plugins/install-git'), { waitUntil: 'networkidle' })
}


test('should install a plugin via remote repository', async ({ page }) => {
    await goToInstallPage(page)

    await page.fill('input[name="repository"]', 'https://github.com/sidekick-coder/zenith-backup.git')
    await page.fill('input[name="branch"]', 'build')
    await page.click('button[type="submit"]')

    await page.waitForURL(baseURL('/admin/plugins'), { waitUntil: 'networkidle' })

    await page.waitForSelector('text=zenith-backup')
})

test('should install a plugin via remote repository with ssh key', async ({ page }) => {
    const identity = process.env.ZENITH_TEST_PLUGIN_IDENTITY || ''
    const repository = process.env.ZENITH_TEST_PLUGIN_REPO || ''
    const sshKey = process.env.ZENITH_TEST_PLUGIN_SSH_KEY || ''

    if (!identity || !repository || !sshKey) {
        test.skip(true, 'Environment variables ZENITH_TEST_PLUGIN_IDENTITY, ZENITH_TEST_PLUGIN_REPO, and ZENITH_TEST_PLUGIN_SSH_KEY must be set for this test.')
        return
    }

    await goToInstallPage(page)

    await page.fill('input[name="repository"]', repository)
    await page.fill('input[name="branch"]', 'build')
    await page.fill('textarea[name="ssh_key"]', sshKey + '\n') // Add a newline to ensure the key is properly formatted
    await page.click('button[type="submit"]')

    await page.waitForURL(baseURL('/admin/plugins'), { waitUntil: 'networkidle' })

    expect(page.getByText(identity)).toBeAttached()
})


test('should install a plugin with ssh key on binded volume', async ({ page }) => {
    const identity = process.env.ZENITH_TEST_PLUGIN_IDENTITY || ''
    const repository = process.env.ZENITH_TEST_PLUGIN_REPO || ''
    const sshKey = process.env.ZENITH_TEST_PLUGIN_SSH_KEY || ''

    if (!identity || !repository || !sshKey) {
        test.skip(true, 'Environment variables ZENITH_TEST_PLUGIN_IDENTITY, ZENITH_TEST_PLUGIN_REPO, and ZENITH_TEST_PLUGIN_SSH_KEY must be set for this test.')
        return
    }

    const volumeId = Date.now().toString()
    const volumePath = path.resolve(os.tmpdir(), `zenith-test-volumes-${volumeId}`)

    createApp({
        build: (builder) => {
            builder.withBindMounts([
                {
                    source: path.join(volumePath, 'tmp'),
                    target: '/data/tmp',
                    mode: 'rw',
                },
                {
                    source: path.join(volumePath, 'plugins'),
                    target: '/data/plugins',
                    mode: 'rw',
                }
            ])
        }
    })

    await goToInstallPage(page)

    await page.fill('input[name="repository"]', repository)
    await page.fill('input[name="branch"]', 'build')
    await page.fill('textarea[name="ssh_key"]', sshKey + '\n') // Add a newline to ensure the key is properly formatted
    await page.click('button[type="submit"]')

    await page.waitForURL(baseURL('/admin/plugins'), { waitUntil: 'networkidle' })

    await expect(page.getByText(identity)).toBeAttached()
})
