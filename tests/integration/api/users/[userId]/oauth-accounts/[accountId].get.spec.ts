import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('GET /api/users/[userId]/oauth-accounts/[accountId]', () => {
    let api: HttpTesterService
    let userId: number
    let accountId: number

    beforeAll(async () => {
        const user = await createUser()
        const account = await OauthAccount.create({
            user_id: user.id,
            provider: 'test',
            provider_user_id: 'provider-user-detail',
            provider_user_email: 'detail@example.com',
        })

        userId = user.id
        accountId = account.id
    })

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('returns a user OAuth account', async () => {
        const response = await api.get(`/api/users/${userId}/oauth-accounts/${accountId}`)

        expect(response.body).toMatchObject({
            id: accountId,
            user_id: userId,
            provider: 'test',
            provider_user_id: 'provider-user-detail',
            provider_user_email: 'detail@example.com',
        })
    })
})
