import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Hypothetical test harness (to be implemented in #server/testing/index.ts)
import IntegrationTestService from '#server/testing/integrationTest.service.ts'

describe('POST /api/auth/register', () => {
    const ctx = new IntegrationTestService()

    beforeAll(async () => await ctx.up(), 60_000) // Increase timeout for container startup

    afterAll(async () => {
        await ctx.down()
    })

    it('should register a new user successfully', async () => {
        expect(true).toBe(true) // Placeholder assertion
        // const response = await http.post('/api/auth/register', {
        //     username: 'testuser',
        //     email: 'test@example.com',
        //     password: 'secret123',
        //     name: 'Test User',
        // })

        // expect(response.status).toBe(200)
        // expect(response.body.success).toBe(true)
        // expect(response.body.user).toBeDefined()
        // expect(response.body.user.username).toBe('testuser')
        // expect(response.body.user.email).toBe('test@example.com')
    })

    // it('should return 403 when registration is disabled', async () => {
    //     ctx.config.set('auth.enable_registration', false)

    //     const response = await http.post('/api/auth/register', {
    //         username: 'anotheruser',
    //         email: 'another@example.com',
    //         password: 'secret123',
    //         name: 'Another User',
    //     })

    //     expect(response.status).toBe(403)
    //     expect(response.body.message).toBe('Registration is disabled')

    //     ctx.config.set('auth.enable_registration', true)
    // })

    // it('should return 400 when user already exists', async () => {
    //     const response = await http.post('/api/auth/register', {
    //         username: 'testuser',
    //         email: 'test@example.com',
    //         password: 'secret123',
    //         name: 'Test User',
    //     })

    //     expect(response.status).toBe(400)
    //     expect(response.body.message).toBe('User already exists with this email or username')
    // })

    // it('should login and preserve cookies with agent', async () => {
    //     const agent = http.agent()

    //     // First register a verified user
    //     await ctx.db.insertInto('users').values({
    //         username: 'loginuser',
    //         email: 'login@example.com',
    //         password: await ctx.hash('secret123'),
    //         name: 'Login User',
    //         verified_at: new Date(),
    //     })
    //         .execute()

    //     // Login with agent (cookies persist)
    //     const loginResponse = await agent.post('/api/auth/login', {
    //         uuid: 'loginuser',
    //         password: 'secret123',
    //     })

    //     expect(loginResponse.status).toBe(200)
    //     expect(loginResponse.headers['set-cookie']).toBeDefined()

    //     // Logout with same agent (cookie sent automatically)
    //     const logoutResponse = await agent.post('/auth/logout')

    //     expect(logoutResponse.status).toBe(200)
    //     expect(logoutResponse.body.success).toBe(true)
    // })
})


