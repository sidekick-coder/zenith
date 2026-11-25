import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import UserMeta from '#server/entities/userMeta.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('GET /api/users/[userId]/metas/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('returns a user meta', async () => {
        const user = await createUser()
        const userMeta = await UserMeta.create({
            user_id: user.id,
            name: 'timezone',
            value: 'UTC',
        })

        const response = await api.get(`/api/users/${user.id}/metas/${userMeta.id}`)

        expect(response.body).toMatchObject({
            id: userMeta.id,
            user_id: user.id,
            name: 'timezone',
            value: 'UTC',
        })
    })

    it('does not return a meta belonging to another user', async () => {
        const user = await createUser()
        const otherUser = await createUser()
        const userMeta = await UserMeta.create({
            user_id: otherUser.id,
            name: 'private',
            value: 'value',
        })

        const response = await api.get(`/api/users/${user.id}/metas/${userMeta.id}`)

        expect(response.body).toMatchObject({ status: 404 })
    })
})
