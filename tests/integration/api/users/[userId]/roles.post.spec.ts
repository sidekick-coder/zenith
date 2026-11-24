import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import Role from '#server/entities/role.entity.ts'
import UserRole from '#server/entities/userRole.entity.ts'
import { createUser } from '#tests/utils/users.ts'

describe('POST /api/users/[userId]/roles', () => {
    let api: HttpTesterService
    let userId: number
    let roleId: number

    beforeAll(async () => {
        const user = await createUser()
        const role = await Role.create({ name: 'User roles POST test' })

        userId = user.id
        roleId = role.id
    })

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('assigns a role to a user', async () => {
        const response = await api.post(`/api/users/${userId}/roles`, { role_id: roleId, })

        expect(response.body).toEqual({ success: true })

        const userRole = await UserRole.findOne({
            where: eb => eb.and({
                user_id: userId,
                role_id: roleId,
            }),
        })

        expect(userRole).toBeDefined()
    })
})
