import { test, expect } from '@playwright/test'
import { GenericContainer, StartedTestContainer } from 'testcontainers'

let url: string
let container: StartedTestContainer

async function createZenithContainer() {
    const builder = new GenericContainer('zenith-test')
        .withExposedPorts(3000)
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

    await createZenithContainer()
})

test.afterAll(async () => {
    if (container) {
        await container.stop()
    }
})


test('should complete database setup', async ({ page }) => {
    // welcome
    await page.goto(baseURL('/'))

    const startBtn = page.locator('a:has-text("Start Setup")')

    await expect(page).toHaveTitle(/Zenith/)
    await expect(startBtn).toBeVisible()

    await startBtn.click()

    await expect(page).toHaveURL(/.*\/setup\/database/)

    // database setup
    await page.locator('[data-slot="select-trigger"]').click()

    await page.locator('[data-slot="select-item"]:has-text("SQLite")').click()

    const dbPath = '/tmp/test.db'

    await page.fill('[name="options.database"]', dbPath)

    await expect(page.locator('[name="options.database"]')).toHaveValue(dbPath)

    await page.click('button:has-text("Submit")')

    await expect(page).toHaveURL(/.*\/setup\/user/)

    // user setup
    await page.fill('[name="name"]', 'testuser')
    await page.fill('[name="username"]', 'testuser')
    await page.fill('[name="email"]', 'testuser@test.com')
    await page.fill('[name="password"]', 'testpassword')
    await page.fill('[name="confirmPassword"]', 'testpassword')

    await page.click('button:has-text("Submit")')

    await expect(page).toHaveURL(/.*\/api\/reloader/)

    // login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000, }) // Increase timeout to wait for server reload

    await page.fill('[name="uuid"]', 'testuser')
    await page.fill('[name="password"]', 'testpassword')

    await page.click('button:has-text("Log in")')

    await expect(page).toHaveURL(/.*\//)

    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible()
})
