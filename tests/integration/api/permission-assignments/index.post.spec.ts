import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import db from '#server/facades/db.facade.ts'
import Permission from '#server/entities/permission.entity.ts'

describe('POST /api/permission-assignments', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.post('/api/permission-assignments', {
            assign_type: 'user',
            assign_id: 'assignment-post-user',
            permission_id: 1,
        })

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('creates an assignment', async () => {
        const permission = await Permission.create({
            name: 'Assignment create integration test',
            origin: 'custom',
            action: 'read',
            subject: 'IntegrationTest',
        })
        const payload = {
            assign_type: 'user',
            assign_id: 'assignment-post-user',
            permission_id: permission.id,
        }

        await api.loginByUsername('admin')

        const response = await api.post('/api/permission-assignments', payload)

        expect(response.body).toMatchObject({
            permission_id: permission.id,
            assignable_type: payload.assign_type,
            assignable_id: payload.assign_id,
        })
        expect(response.body.id).toEqual(expect.any(Number))

        await expect(db.selectFrom('permissions_assignments')
            .selectAll()
            .where('id', '=', response.body.id)
            .executeTakeFirst()
        ).resolves.toMatchObject({
            permission_id: permission.id,
            assignable_type: payload.assign_type,
            assignable_id: payload.assign_id,
        })
    })

    it('does not create duplicate assignments', async () => {
        const permission = await Permission.create({
            name: 'Assignment duplicate integration test',
            origin: 'custom',
            action: 'read',
            subject: 'IntegrationTest',
        })
        const payload = {
            assign_type: 'user',
            assign_id: 'assignment-duplicate-user',
            permission_id: permission.id,
        }

        await api.loginByUsername('admin')

        const firstResponse = await api.post('/api/permission-assignments', payload)
        const secondResponse = await api.post('/api/permission-assignments', payload)

        expect(secondResponse.body.id).toBe(firstResponse.body.id)

        const assignments = await db.selectFrom('permissions_assignments')
            .selectAll()
            .where('permission_id', '=', permission.id)
            .where('assignable_type', '=', payload.assign_type)
            .where('assignable_id', '=', payload.assign_id)
            .execute()

        expect(assignments).toHaveLength(1)
    })
})
