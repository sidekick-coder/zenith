import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Permission from '#server/entities/permission.entity.ts'

describe('GET /api/permissions', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get('/api/permissions')

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists permissions', async () => {
        const permission = await Permission.create({
            name: 'Permissions list integration test',
            description: 'Permission list description',
            origin: 'custom',
            action: 'read',
            subject: 'IntegrationTest',
        })

        await api.loginByUsername('admin')

        const response = await api.get('/api/permissions?page=1&limit=100')

        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: permission.id,
                name: permission.name,
                action: 'read',
                subject: 'IntegrationTest',
            }),
        ]))
    })
})
