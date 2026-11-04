import { test, expect } from '@playwright/test'
import ZenithContainerStarted from '../entities/ZenithContainerStarted.ts'
import ZenithContainer from '../entities/ZenithContainer.ts'

let container: ZenithContainerStarted

async function createZenithContainer() {
    const builder = ZenithContainer.create()

    builder.setConfig({})

    container = await builder.start()
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
    await page.goto(container.makeURL('/'), { waitUntil: 'networkidle' })

    const startBtn = page.locator('a:has-text("Start Setup")')

    await expect(page).toHaveTitle(/Zenith/)
    await expect(startBtn).toBeVisible()

    await startBtn.click()

    await expect(page).toHaveURL(/.*\/setup\/database/)

    // database setup
    await page.locator('[data-slot="select-trigger"]').click()

    await expect(page.locator('[data-slot="select-item"]:has-text("SQLite")')).toBeVisible()

    await page.locator('[data-slot="select-item"]:has-text("SQLite")').click()

    const dbPath = '/tmp/test.db'

    await page.fill('[name="options.database"]', dbPath)

    await expect(page.locator('[name="options.database"]')).toHaveValue(dbPath)

    await page.click('button:has-text("Submit")')

    await expect(page).toHaveURL(/.*\/setup\/user/)

    await page.waitForLoadState('networkidle')

    // user setup
    await page.fill('[name="name"]', 'testuser')
    await page.fill('[name="username"]', 'testuser')
    await page.fill('[name="email"]', 'testuser@test.com')
    await page.fill('[name="password"]', 'testpassword')
    await page.fill('[name="confirmPassword"]', 'testpassword')

    await page.click('button:has-text("Submit")')

    await expect(page).toHaveURL(/.*\/api\/reloader/)

    await page.waitForLoadState('networkidle')

    // login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 20000, }) // Increase timeout to wait for server reload

    await page.waitForLoadState('networkidle')

    await page.fill('[name="uuid"]', 'testuser')
    await page.fill('[name="password"]', 'testpassword')

    await page.click('button:has-text("Log in")')

    await expect(page).toHaveURL(/.*\//)

    await page.waitForLoadState('networkidle')

    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible()
})
