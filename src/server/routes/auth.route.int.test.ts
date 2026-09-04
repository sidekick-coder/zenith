import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { faker } from '@faker-js/faker'

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

        const adminEmail = faker.internet.email()
        const adminPassword = faker.internet.password({ length: 10 })
        const adminUsername = faker.internet.username()

        const user = await app.users.create({
            email: adminEmail,
            password: adminPassword,
            username: adminUsername
        })

        await user.addPermission({
            name: 'Full Access',
            action: 'manage',
            subject: 'all',
        })

        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: adminUsername,
            password: adminPassword,
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

        const username = faker.internet.username()
        const email = faker.internet.email()
        const password = faker.internet.password({ length: 10 })
        const name = faker.person.fullName()

        const response = await fetcher.post<any>('/api/auth/register', {
            username,
            email,
            password,
            name,
        })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.user).toBeDefined()
        expect(response.body.user.username).toBe(username)
        expect(response.body.user.email).toBe(email)
    })

    it('should return 403 when registration is disabled', async () => {
        await setAuthConfig({ enable_registration: false })

        const response = await fetcher.post<any>('/api/auth/register', {
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: faker.internet.password({ length: 10 }),
            name: faker.person.fullName(),
        })

        expect(response.status).toBe(403)
        expect(response.body.message).toBe('Registration is disabled')

        await setAuthConfig({ enable_registration: true })
    })

    it('should return 400 when user already exists', async () => {
        const username = faker.internet.username()
        const email = faker.internet.email()
        const password = faker.internet.password({ length: 10 })
        const name = faker.person.fullName()

        // Create user first
        await fetcher.post<any>('/api/auth/register', {
            username,
            email,
            password,
            name,
        })

        // Try to register again with same credentials
        const response = await fetcher.post<any>('/api/auth/register', {
            username,
            email,
            password,
            name,
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('User already exists with this email or username')
    })
})

describe('POST /api/auth/login', () => {
    const app = new AppIntegrationTestService()
    const fetcher = new FetcherService()

    app.withPostgresDatabase()

    beforeAll(async () => {
        await app.up()
        await app.migrate()

        fetcher.setBaseUrl(app.url)
    })

    afterAll(async () => {
        await app.down()
    })

    it('should login successfully with username', async () => {
        const username = faker.internet.username()
        const email = faker.internet.email()
        const password = faker.internet.password({ length: 10 })

        await app.users.create({
            username,
            email,
            password,
        })

        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: username,
            password,
        })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.token).toBeDefined()
        expect(response.body.user).toBeDefined()
        expect(response.body.user.username).toBe(username)
        expect(response.body.user.email).toBe(email)
    })

    it('should login successfully with email', async () => {
        const username = faker.internet.username()
        const email = faker.internet.email()
        const password = faker.internet.password({ length: 10 })

        await app.users.create({
            username,
            email,
            password,
        })

        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: email,
            password,
        })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.token).toBeDefined()
        expect(response.body.user).toBeDefined()
        expect(response.body.user.username).toBe(username)
        expect(response.body.user.email).toBe(email)
    })

    it('should return 401 with invalid password', async () => {
        const username = faker.internet.username()
        const email = faker.internet.email()
        const password = faker.internet.password({ length: 10 })

        await app.users.create({
            username,
            email,
            password,
        })

        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: username,
            password: faker.internet.password({ length: 10 }),
        })

        expect(response.status).toBe(401)
        expect(response.body.success).toBeUndefined()
    })

    it('should return 401 with non-existent user', async () => {
        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: faker.internet.username(),
            password: faker.internet.password({ length: 10 }),
        })

        expect(response.status).toBe(401)
        expect(response.body.success).toBeUndefined()
    })

    it('should return 400 when already logged in', async () => {
        const username = faker.internet.username()
        const email = faker.internet.email()
        const password = faker.internet.password({ length: 10 })

        await app.users.create({
            username,
            email,
            password,
        })

        const loginResponse = await fetcher.post<any>('/api/auth/login', {
            uuid: username,
            password,
        })

        const token = loginResponse.body.token

        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: username,
            password,
        }, {
            headers: {
                Cookie: `Authorization=${token}`
            }
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Already logged in')
    })

    it('should set Authorization cookie on successful login', async () => {
        const username = faker.internet.username()
        const email = faker.internet.email()
        const password = faker.internet.password({ length: 10 })

        await app.users.create({
            username,
            email,
            password,
        })

        const response = await fetcher.post<any>('/api/auth/login', {
            uuid: username,
            password,
        })

        expect(response.status).toBe(200)
        expect(response.headers['set-cookie']).toBeDefined()
        
        const setCookieHeader = response.headers['set-cookie']
        const cookieString = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader
        
        expect(cookieString).toContain('Authorization=')
        expect(cookieString).toContain('HttpOnly')
    })
})
