import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'
import UserRole from '#server/entities/userRole.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('DELETE /api/users/[userId]/roles/[roleId]', () => {
    let api: HttpTesterService
    let userId: number
    let roleId: number
    let userRoleId: number

    beforeAll(async () => {
        const user = await createUser()
        const role = await Role.create({ name: 'User roles DELETE test' })
        const userRole = await UserRole.create({
            user_id: user.id,
            role_id: role.id,
        })

        userId = user.id
        roleId = role.id
        userRoleId = userRole.id
    })

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('removes a role from a user', async () => {
        const response = await api.create(api.request.delete(`/api/users/${userId}/roles/${roleId}`))

        expect(response.body).toEqual({ success: true })

        const userRole = await UserRole.findOne({ where: eb => eb('id', '=', userRoleId), })

        expect(userRole).toBeNull()
    })
})
