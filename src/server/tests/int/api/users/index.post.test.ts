
import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpTesterService } from '@sidekick-coder/zenith-kit/server'
import { makeUser } from '#server/tests/fixtures/users.ts'

describe('POST /api/users', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('should create a new user', async () => {

        await api.loginByUsername('admin')

        const payload = makeUser()

        const response = await api.post('/api/users', payload)

        expect(response.body).toEqual({
            id: expect.any(Number),
            name: payload.name,
            username: payload.username,
            email: payload.email,
            created_at: expect.any(String),
            updated_at: expect.any(String),
            verified_at: expect.any(String),
            deleted_at: null,
        })
    })
})
