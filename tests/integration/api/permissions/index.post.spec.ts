import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Permission from '#server/entities/permission.entity.ts'

describe('POST /api/permissions', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.post('/api/permissions', {
            name: 'Unauthorized permission',
            action: 'read',
            subject: 'IntegrationTest',
        })

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('creates a custom permission', async () => {
        const payload = {
            name: 'Permission create integration test',
            description: 'Permission create description',
            action: 'manage',
            subject: 'IntegrationTest',
            conditions: { owner_id: '{{ user.id }}', },
        }

        await api.loginByUsername('admin')

        const response = await api.post('/api/permissions', payload)

        expect(response.body).toMatchObject({
            name: payload.name,
            description: payload.description,
            origin: 'custom',
            action: payload.action,
            subject: payload.subject,
        })
        expect(response.body.id).toEqual(expect.any(Number))

        await expect(Permission.findOne({ where: eb => eb('id', '=', response.body.id), }))
            .resolves.toMatchObject({
                name: payload.name,
                origin: 'custom',
                action: payload.action,
                subject: payload.subject,
            })
    })
})
