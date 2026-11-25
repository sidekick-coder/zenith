import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Permission from '#server/entities/permission.entity.ts'

describe('GET /api/permissions/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('returns a permission', async () => {
        const permission = await Permission.create({
            name: 'Permission detail integration test',
            description: 'Permission detail description',
            origin: 'custom',
            action: 'update',
            subject: 'IntegrationTest',
        })

        const response = await api.get(`/api/permissions/${permission.id}`)

        expect(response.body).toMatchObject({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            action: 'update',
            subject: 'IntegrationTest',
        })
    })
})
