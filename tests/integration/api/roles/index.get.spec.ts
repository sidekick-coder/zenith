import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'

describe('GET /api/roles', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get('/api/roles')

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists roles', async () => {
        const role = await Role.create({ name: 'Roles list integration test' })

        await api.loginByUsername('admin')

        const response = await api.get('/api/roles?page=1&limit=100')

        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: role.id,
                name: role.name,
            }),
        ]))
    })
})
