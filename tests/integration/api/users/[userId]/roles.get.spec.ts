import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'
import UserRole from '#server/entities/userRole.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('GET /api/users/[userId]/roles', () => {
    let api: HttpTesterService
    let userId: number

    beforeAll(async () => {
        const user = await createUser()
        const role = await Role.create({ name: 'User roles GET test' })

        await UserRole.create({
            user_id: user.id,
            role_id: role.id,
        })

        userId = user.id
    })

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get(`/api/users/${userId}/roles`)

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists the roles assigned to a user', async () => {
        await api.loginByUsername('admin')

        const response = await api.get(`/api/users/${userId}/roles`)

        expect(response.body.items).toHaveLength(1)
        expect(response.body.items[0]).toMatchObject({ name: 'User roles GET test', })
    })
})
