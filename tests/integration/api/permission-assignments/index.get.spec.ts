import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import db from '#server/facades/db.facade.ts'
import Permission from '#server/entities/permission.entity.ts'

describe('GET /api/permission-assignments', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get(
            '/api/permission-assignments?assign_type=user&assign_id=assignment-get-user'
        )

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists assignments with their permissions', async () => {
        const permission = await Permission.create({
            name: 'Assignment list integration test',
            origin: 'custom',
            action: 'read',
            subject: 'IntegrationTest',
        })
        const assignment = await db.insertInto('permissions_assignments').values({
            permission_id: permission.id,
            assignable_type: 'user',
            assignable_id: 'assignment-get-user',
        })
            .returningAll()
            .executeTakeFirstOrThrow()

        await api.loginByUsername('admin')

        const response = await api.get(
            '/api/permission-assignments?assign_type=user&assign_id=assignment-get-user'
        )

        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: assignment.id,
                permission: expect.objectContaining({
                    id: permission.id,
                    name: permission.name,
                }),
            }),
        ]))
    })
})
