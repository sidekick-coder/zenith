import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'

describe('PATCH /api/roles/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('updates a role', async () => {
        const role = await Role.create({
            name: 'Role update before',
            description: 'Before update',
        })
        const payload = {
            name: 'Role update after',
            description: 'After update',
        }

        const response = await api.create(
            api.request.patch(`/api/roles/${role.id}`).send(payload)
        )

        expect(response.body).toMatchObject({
            id: role.id,
            ...payload,
        })

        await expect(Role.findOne({ where: eb => eb('id', '=', role.id), }))
            .resolves.toMatchObject(payload)
    })
})
