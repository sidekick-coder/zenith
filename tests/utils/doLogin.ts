import { Page } from '@playwright/test'
import ZenithContainerStarted from '../entities/ZenithContainerStarted.ts'

interface LoginOptions {
    container: ZenithContainerStarted
    page: Page
    username?: string
    password?: string
}

export async function doLogin(options: LoginOptions) {
    const container = options.container
    const page = options.page
    const username = options.username || 'admin'
    const password = options.password || 'admin-123'

    const isLoggedIn = await page.evaluate(() => {
        // @ts-expect-error evaluate window.__INITIAL_STATE__
        const state = window.__INITIAL_STATE__

        if (!state) return false

        return !!state['auth:user']
    })

    if (!isLoggedIn) {
        await page.goto(container.makeURL('/auth/login'), { waitUntil: 'networkidle' })

        // login
        await page.fill('input[name="uuid"]', username)
        await page.fill('input[name="password"]', password)
        await page.click('button[type="submit"]')

        await page.waitForLoadState('networkidle')
        await page.waitForURL(container.makeURL('/'))
    }
}
