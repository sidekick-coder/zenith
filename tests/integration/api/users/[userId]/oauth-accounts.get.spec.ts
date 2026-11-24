import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('GET /api/users/[userId]/oauth-accounts', () => {
    let api: HttpTesterService
    let userId: number

    beforeAll(async () => {
        const user = await createUser()

        await OauthAccount.create({
            user_id: user.id,
            provider: 'test',
            provider_user_id: 'provider-user-list',
            provider_user_email: 'list@example.com',
        })

        userId = user.id
    })

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get(`/api/users/${userId}/oauth-accounts`)

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists a user OAuth account', async () => {
        await api.loginByUsername('admin')

        const response = await api.get(`/api/users/${userId}/oauth-accounts`)

        expect(response.body.items).toEqual([
            expect.objectContaining({
                user_id: userId,
                provider: 'test',
                provider_user_id: 'provider-user-list',
                provider_user_email: 'list@example.com',
            }),
        ])
    })
})
