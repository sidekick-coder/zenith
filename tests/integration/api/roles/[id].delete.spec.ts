import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'

describe('DELETE /api/roles/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('soft-deletes a role', async () => {
        const role = await Role.create({ name: 'Role delete integration test' })

        const response = await api.create(
            api.request.delete(`/api/roles/${role.id}`)
        )

        expect(response.body).toMatchObject({
            id: role.id,
            name: role.name,
            deleted_at: expect.any(String),
        })

        await expect(Role.findOne({
            where: eb => eb('id', '=', role.id),
            withDeleted: true,
        })).resolves.toMatchObject({ deleted_at: expect.any(String), })
    })
})
