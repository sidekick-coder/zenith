import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import UserMeta from '#server/entities/userMeta.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('DELETE /api/users/[userId]/metas/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('soft-deletes a user meta', async () => {
        const user = await createUser()
        const userMeta = await UserMeta.create({
            user_id: user.id,
            name: 'temporary',
            value: 'value',
        })

        const response = await api.create(
            api.request.delete(`/api/users/${user.id}/metas/${userMeta.id}`)
        )

        expect(response.body).toMatchObject({
            id: userMeta.id,
            name: 'temporary',
            value: 'value',
        })

        await expect(UserMeta.findOne({
            where: eb => eb('id', '=', userMeta.id),
            withDeleted: true,
        })).resolves.toMatchObject({ deleted_at: expect.any(String) })

        const listResponse = await api.get(`/api/users/${user.id}/metas`)
        expect(listResponse.body.items).not.toEqual(expect.arrayContaining([
            expect.objectContaining({ id: userMeta.id }),
        ]))
    })
})
