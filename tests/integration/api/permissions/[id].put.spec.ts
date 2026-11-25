import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Permission from '#server/entities/permission.entity.ts'

describe('PUT /api/permissions/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('updates a permission', async () => {
        const permission = await Permission.create({
            name: 'Permission update before',
            description: 'Before update',
            origin: 'custom',
            action: 'read',
            subject: 'IntegrationTest',
        })
        const payload = {
            name: 'Permission update after',
            description: 'After update',
            action: 'update',
            subject: 'UpdatedIntegrationTest',
        }

        const response = await api.create(
            api.request.put(`/api/permissions/${permission.id}`).send(payload)
        )

        expect(response.body).toMatchObject({
            id: permission.id,
            ...payload,
        })

        await expect(Permission.findOne({ where: eb => eb('id', '=', permission.id), }))
            .resolves.toMatchObject(payload)
    })
})
