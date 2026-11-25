import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Permission from '#server/entities/permission.entity.ts'

describe('DELETE /api/permissions/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('soft-deletes a permission', async () => {
        const permission = await Permission.create({
            name: 'Permission delete integration test',
            origin: 'custom',
            action: 'delete',
            subject: 'IntegrationTest',
        })

        const response = await api.create(
            api.request.delete(`/api/permissions/${permission.id}`)
        )

        expect(response.body).toMatchObject({
            id: permission.id,
            name: permission.name,
        })

        await expect(Permission.findOne({
            where: eb => eb('id', '=', permission.id),
            withDeleted: true,
        })).resolves.toMatchObject({ deleted_at: expect.any(String), })
    })
})
