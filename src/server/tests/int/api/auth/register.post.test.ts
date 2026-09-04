import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http, HttpTesterService } from '@sidekick-coder/zenith-kit/server'
import { config } from '@sidekick-coder/zenith-kit/server'
import nodemailer from 'nodemailer'
import mailer from '#server/facades/mailer.facade.ts'
import { makeUser, createUser } from '#server/tests/fixtures/users.ts'

describe('POST /api/auth/register', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
        config.set('auth.enable_registration', true)
    })

    function createPayload(data: any = {}) {
        const payload: any = makeUser(data)

        payload.password_confirmation = payload.password

        return payload
    }

    async function createFakeMailer() {
        const testAccount = await nodemailer.createTestAccount()

        config.set('mailer.default', 'test')

        config.set('mailer.gateways.test', {
            type: 'smtp',
            config: {
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                username: testAccount.user,
                password: testAccount.pass,
                secure: testAccount.smtp.secure,
            }
        })

        await mailer.load()

        const testMailer = mailer.get('test')!

        return {
            testAccount,
            testMailer,
        }
    }

    it('should throw an error if registration is disabled', async () => {
        config.set('auth.enable_registration', false)
        config.set('auth.enable_email_verification', false)

        const payload = createPayload()

        const response = await api.post('/api/auth/register', payload)

        expect(response.body).toMatchObject({
            status: 403,
            message: 'Registration is disabled',
        })
    })

    it('should throw an error is the user is already logged in', async () => {
        const payload = createPayload()

        const user = await createUser()

        await api.loginByUser(user)

        const response = await api.post('/api/auth/register', payload)

        expect(response.body).toMatchObject({
            status: 403,
            message: 'Already logged in',
        })
    })

    it('should throw an error email is already taken', async () => {
        const user = await createUser()

        const payload = createPayload({ email: user.email })

        const response = await api.post('/api/auth/register', payload)

        expect(response.body).toMatchObject({
            status: 400,
            message: 'User already exists with this email or username',
        })
    })

    it('should throw an error username is already taken', async () => {
        const user = await createUser()

        const payload = createPayload({ username: user.username })

        const response = await api.post('/api/auth/register', payload)

        expect(response.body).toMatchObject({
            status: 400,
            message: 'User already exists with this email or username',
        })
    })

    it('should create an user with verified_at defined if email verification is disabled', async () => {
        config.set('auth.enable_email_verification', false)

        const payload = createPayload()

        const response = await api.post('/api/auth/register', payload)

        expect(response.body).toMatchObject({
            success: true,
            message: 'Registration successful',
            user: {
                username: payload.username,
                email: payload.email,
                verified_at: expect.any(String),
            }
        })
    })

    it('should create an user with unverified email if email verification is enabled', async () => {
        config.set('auth.enable_email_verification', true)

        await createFakeMailer()

        const payload = createPayload()

        const response = await api.post('/api/auth/register', payload)

        expect(response.body).toMatchObject({
            success: true,
            message: 'Registration successful',
            user: {
                username: payload.username,
                email: payload.email,
                verified_at: null,
            }
        })
    })

    it('should send verification email if email verification is enabled', async () => {
        config.set('auth.enable_email_verification', true)

        const { testMailer } = await createFakeMailer()

        const payload = createPayload()

        const spy = vi.spyOn(testMailer, 'send')

        await api.post('/api/auth/register', payload)

        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            to: payload.email,
            subject: 'Verify Your Email Address',
        }))
    })
})
