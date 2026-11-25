import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import db from '#server/facades/db.facade.ts'
import Permission from '#server/entities/permission.entity.ts'

describe('DELETE /api/permission-assignments/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('deletes an assignment', async () => {
        const permission = await Permission.create({
            name: 'Assignment delete integration test',
            origin: 'custom',
            action: 'read',
            subject: 'IntegrationTest',
        })
        const assignment = await db.insertInto('permissions_assignments').values({
            permission_id: permission.id,
            assignable_type: 'user',
            assignable_id: 'assignment-delete-user',
        })
            .returningAll()
            .executeTakeFirstOrThrow()

        const response = await api.create(
            api.request.delete(`/api/permission-assignments/${assignment.id}`)
        )

        expect(response.body).toEqual({ success: true })

        await expect(db.selectFrom('permissions_assignments')
            .selectAll()
            .where('id', '=', assignment.id)
            .executeTakeFirst()
        ).resolves.toBeUndefined()
    })
})
