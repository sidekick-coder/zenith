import { test, expect } from '@playwright/test'
import { GenericContainer, Network, StartedNetwork, StartedTestContainer } from 'testcontainers'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'

let url: string
let network: StartedNetwork
let appContainer: StartedTestContainer
let pgContainer: StartedPostgreSqlContainer

async function createNetwork() {
    network = await new Network().start()
}

async function createZenithContainer() {
    appContainer = await new GenericContainer('zenith-test')
        .withExposedPorts(3000)
        .withNetwork(network)
        .withNetworkAliases('app')
        .withHealthCheck({
            test: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
            interval: 1000,
            timeout: 1000,
            retries: 30,
        })
        .start()

    url = `http://${appContainer.getHost()}:${appContainer.getMappedPort(3000)}`
}

async function createPgContainer() {
    pgContainer = await new PostgreSqlContainer('postgres:17')
        .withNetwork(network)
        .withNetworkAliases('pg')
        .start()
}

function baseURL(...args: string[]) {
    const u = new URL(url)

    u.pathname = args.join('/')

    return u.toString()
}

test.beforeAll(async () => {
    test.setTimeout(120000) // Increase timeout for container startup

    await createNetwork()
    await createPgContainer()
    await createZenithContainer()
})

test.afterAll(async () => {
    await appContainer.stop()
    await pgContainer.stop()
    await network.stop()
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

    await page.locator('[data-slot="select-item"]:has-text("PostgreSQL")').click()

    await page.fill('[name="options.host"]', 'pg')
    await page.fill('[name="options.port"]', '5432')
    await page.fill('[name="options.user"]', pgContainer.getUsername())
    await page.fill('[name="options.password"]', pgContainer.getPassword())
    await page.fill('[name="options.database"]', pgContainer.getDatabase())

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
    await expect(page).toHaveURL(/.*\/login/, { timeout: 20000, }) // Increase timeout to wait for server reload

    await page.fill('[name="uuid"]', 'testuser')
    await page.fill('[name="password"]', 'testpassword')

    await page.click('button:has-text("Log in")')

    await expect(page).toHaveURL(/.*\//)

    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible()
})
