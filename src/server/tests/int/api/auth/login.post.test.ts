import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpTesterService } from '@sidekick-coder/zenith-kit/server'
import { createUser } from '#server/tests/fixtures/users.ts'

describe('POST /api/auth/login', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('should throw an error if already logged in', async () => {
        const user = await createUser()

        await api.loginByUser(user)

        const response = await api.post('/api/auth/login', {
            uuid: user.email,
            password: user.password,
        })

        expect(response.body).toMatchObject({
            status: 403,
            message: 'Already logged in',
        })
    })

    it('should throw an error if email/username is invalid', async () => {
        const response = await api.post('/api/auth/login', {
            uuid: 'invalid-email',
            password: 'password',
        })

        expect(response.body).toMatchObject({
            status: 401,
            message: $t('Invalid credentials')
        })
    })

    it('should throw an error if user is not verified', async () => {
        const user = await createUser({ verified_at: null })

        const response = await api.post('/api/auth/login', {
            uuid: user.email,
            password: user.password,
        })

        expect(response.body).toMatchObject({
            status: 401,
            message: $t('Please verify your email before logging in')
        })
    })

    it('should throw an error if password is incorrect', async () => {
        const user = await createUser()

        const response = await api.post('/api/auth/login', {
            uuid: user.email,
            password: 'wrong-password',
        })
        
        expect(response.body).toMatchObject({
            status: 401,
            message: $t('Invalid credentials')
        })
    })

    it('should log in successfully with email', async () => {
        const password = 'test-password'
        const user = await createUser({ password })

        const response = await api.post('/api/auth/login', {
            uuid: user.email,
            password,
        })

        expect(response.body).toMatchObject({
            success: true,
            token: expect.any(String),
        })
    })

    it('should log in successfully with username', async () => {
        const password = 'test-password'

        const user = await createUser({ password })

        const response = await api.post('/api/auth/login', {
            uuid: user.username,
            password,
        })

        expect(response.body).toMatchObject({
            success: true,
            token: expect.any(String),
        })
    })

})
