import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'

describe('PUT /api/files/[fileId]/metas/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('updates a file meta', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'meta-update.txt',
            filename: 'meta-update.txt',
            purpose: 'integration-test',
        })
        const meta = await FileMeta.create({
            file_id: file.id,
            name: 'category',
            value: 'before',
        })

        const response = await api.create(
            api.request.put(`/api/files/${file.id}/metas/${meta.id}`).send({
                name: 'updated-category',
                value: 'after',
            })
        )

        expect(response.body).toMatchObject({
            id: meta.id,
            name: 'updated-category',
            value: 'after',
        })
    })
})
