import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'

describe('GET /api/roles/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('returns a role', async () => {
        const role = await Role.create({
            name: 'Role detail integration test',
            description: 'Role detail description',
        })

        const response = await api.get(`/api/roles/${role.id}`)

        expect(response.body).toMatchObject({
            id: role.id,
            name: role.name,
            description: role.description,
        })
    })
})
