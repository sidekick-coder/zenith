import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import ZenithContainer from '../entities/ZenithContainer.ts'
import ZenithContainerStarted from '../entities/ZenithContainerStarted.ts'

interface OauthAccount {
    id: number
    user_id: number
    provider: string
    provider_user_id: string
    provider_user_email: string | null
}

describe('user OAuth accounts routes', () => {
    let container: ZenithContainerStarted
    let authorization: string
    let userId: number
    let accountId: number

    async function request<T>(path: string, init?: RequestInit) {
        const response = await fetch(container.makeURL(path), init)
        const body = await response.json() as T

        return {
            body,
            status: response.status,
        }
    }

    beforeAll(async () => {
        container = await ZenithContainer.create().start()

        const login = await request<{ token: string, user: { id: number } }>('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uuid: 'admin',
                password: 'admin-123',
            }),
        })

        expect(login.status).toBe(200)
        authorization = `Bearer ${login.body.token}`
        userId = login.body.user.id

        const seed = await container.exec([
            'node',
            '-e',
            `const Database = require('better-sqlite3'); const db = new Database('/tmp/zenith.db'); const result = db.prepare('INSERT INTO oauth_accounts (user_id, provider, provider_user_id, provider_user_email) VALUES (?, ?, ?, ?)').run(${userId}, 'test', 'provider-user-1', 'oauth@example.com'); console.log(result.lastInsertRowid)`,
        ])

        expect(seed.exitCode).toBe(0)
        accountId = Number(seed.output.trim())
    })

    afterAll(async () => {
        await container.stop()
    })

    it('requires authentication', async () => {
        const response = await request('/api/users/1/oauth-accounts')

        expect(response.status).toBe(401)
    })

    it('lists and retrieves a user OAuth account', async () => {
        const headers = { Authorization: authorization }
        const path = `/api/users/${userId}/oauth-accounts`

        const listed = await request<{ items: OauthAccount[] }>(path, { headers })

        expect(listed.status).toBe(200)
        expect(listed.body.items).toEqual([
            expect.objectContaining({
                id: accountId,
                user_id: userId,
                provider: 'test',
                provider_user_id: 'provider-user-1',
                provider_user_email: 'oauth@example.com',
            }),
        ])

        const detail = await request<OauthAccount>(`${path}/${accountId}`, { headers })

        expect(detail.status).toBe(200)
        expect(detail.body).toEqual(expect.objectContaining({
            id: accountId,
            user_id: userId,
            provider: 'test',
            provider_user_id: 'provider-user-1',
            provider_user_email: 'oauth@example.com',
        }))
    })

    it('deletes an OAuth account and excludes it from later requests', async () => {
        const headers = { Authorization: authorization }
        const path = `/api/users/${userId}/oauth-accounts`

        const deleted = await request<{ success: boolean }>(`${path}/${accountId}`, {
            method: 'DELETE',
            headers,
        })

        expect(deleted.status).toBe(200)
        expect(deleted.body).toEqual({ success: true })

        const listed = await request<{ items: OauthAccount[] }>(path, { headers })

        expect(listed.status).toBe(200)
        expect(listed.body.items).toEqual([])
    })
})
