import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import OauthAccount from '#server/entities/oauthAccount.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('DELETE /api/users/[userId]/oauth-accounts/[accountId]', () => {
    let api: HttpTesterService
    let userId: number
    let accountId: number

    beforeAll(async () => {
        const user = await createUser()
        const account = await OauthAccount.create({
            user_id: user.id,
            provider: 'test',
            provider_user_id: 'provider-user-delete',
            provider_user_email: 'delete@example.com',
        })

        userId = user.id
        accountId = account.id
    })

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('deletes a user OAuth account', async () => {
        const path = `/api/users/${userId}/oauth-accounts/${accountId}`
        const response = await api.create(api.request.delete(path))

        expect(response.body).toEqual({ success: true })

        const account = await OauthAccount.findOne({ where: eb => eb('id', '=', accountId), })

        expect(account).toBeNull()
    })
})
