import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'

describe('DELETE /api/files/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('soft-deletes a file', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'files-delete.txt',
            filename: 'files-delete.txt',
            purpose: 'integration-test',
        })

        const response = await api.create(
            api.request.delete(`/api/files/${file.id}`)
        )

        expect(response.body).toEqual({ success: true })

        await expect(File.findOne({
            where: eb => eb('id', '=', file.id),
            withDeleted: true,
        })).resolves.toMatchObject({ deleted_at: expect.any(String), })
    })
})
