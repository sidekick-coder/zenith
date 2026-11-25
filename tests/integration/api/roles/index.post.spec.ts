import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'

describe('POST /api/roles', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.post('/api/roles', { name: 'Unauthorized role', })

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('creates a role', async () => {
        const payload = {
            name: 'Role create integration test',
            description: 'Role create description',
        }

        await api.loginByUsername('admin')

        const response = await api.post('/api/roles', payload)

        expect(response.body).toEqual({ deleted_at: null })

        await expect(Role.findOne({ where: eb => eb('name', '=', payload.name), }))
            .resolves.toMatchObject(payload)
    })
})
