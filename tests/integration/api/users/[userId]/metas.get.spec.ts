import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import UserMeta from '#server/entities/userMeta.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('GET /api/users/[userId]/metas', () => {
    let api: HttpTesterService
    let userId: number

    beforeAll(async () => {
        const user = await createUser()

        await UserMeta.create({
            user_id: user.id,
            name: 'first',
            value: 'one',
        })
        await UserMeta.create({
            user_id: user.id,
            name: 'second',
            value: 'two',
        })

        userId = user.id
    })

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('requires authentication', async () => {
        const unauthenticatedApi = new HttpTesterService({ http })
        const response = await unauthenticatedApi.get(`/api/users/${userId}/metas`)

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists only the metas belonging to the user', async () => {
        const otherUser = await createUser()
        await UserMeta.create({
            user_id: otherUser.id,
            name: 'other',
            value: 'user',
        })

        const response = await api.get(`/api/users/${userId}/metas?page=1&limit=10`)

        expect(response.body.items).toHaveLength(2)
        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                user_id: userId,
                name: 'first',
                value: 'one',
            }),
            expect.objectContaining({
                user_id: userId,
                name: 'second',
                value: 'two',
            }),
        ]))
        expect(response.body.items).not.toEqual(expect.arrayContaining([
            expect.objectContaining({ user_id: otherUser.id }),
        ]))
    })
})
