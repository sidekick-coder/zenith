import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'

describe('DELETE /api/files/[fileId]/metas/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('soft-deletes a file meta', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'meta-delete.txt',
            filename: 'meta-delete.txt',
            purpose: 'integration-test',
        })
        const meta = await FileMeta.create({
            file_id: file.id,
            name: 'category',
            value: 'delete',
        })

        const response = await api.create(
            api.request.delete(`/api/files/${file.id}/metas/${meta.id}`)
        )

        expect(response.body).toMatchObject({
            id: meta.id,
            name: 'category',
            value: 'delete',
        })

        await expect(FileMeta.findOne({
            where: eb => eb('id', '=', meta.id),
            withDeleted: true,
        })).resolves.toMatchObject({ deleted_at: expect.any(String), })
    })
})
