import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import AppIntegrationTestService from '#server/testing/appIntegrationTest.service.ts'
import FetcherService from '#server/services/fetcher.service.ts'

describe('POST /api/auth/register', () => {
    const app = new AppIntegrationTestService()
    const fetcher = new FetcherService()
    let token: string

    app.withPostgresDatabase()

    beforeAll(async () => {
        await app.up()
        await app.migrate()

        fetcher.setBaseUrl(app.url)
    })

    afterAll(async () => {
        await app.down()
    })

    async function createAdminToken(){
        if (token) {
            return token
        }

        const user = await app.users.create({
            email: 'admin@example.com',
            password: 'admin-123',
            username: 'admin'
        })

        await user.addPermission({
            name: 'Full Access',
            action: 'manage',
            subject: 'all',
        })

        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: 'admin',
            password: 'admin-123',
        })

        const bodyToken = response.body.token

        token = bodyToken

        return token
    }

    async function setAuthConfig(payload: Record<string, any>) {
        const token = await createAdminToken()

        const options = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        await fetcher.put('/api/configs/auth', payload, options)
    }

    it('should register a new user successfully', async () => {

        await setAuthConfig({ enable_registration: true })

        const response = await fetcher.post<any>('/api/auth/register', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'secret123',
            name: 'Test User',
        })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.user).toBeDefined()
        expect(response.body.user.username).toBe('testuser')
        expect(response.body.user.email).toBe('test@example.com')
    })

    it('should return 403 when registration is disabled', async () => {
        await setAuthConfig({ enable_registration: false })

        const response = await fetcher.post<any>('/api/auth/register', {
            username: 'anotheruser',
            email: 'another@example.com',
            password: 'secret123',
            name: 'Another User',
        })

        expect(response.status).toBe(403)
        expect(response.body.message).toBe('Registration is disabled')

        await setAuthConfig({ enable_registration: true })
    })

    it('should return 400 when user already exists', async () => {
        const response = await fetcher.post<any>('/api/auth/register', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'secret123',
            name: 'Test User',
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('User already exists with this email or username')
    })
})


