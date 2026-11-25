import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'

describe('GET /api/files/[fileId]/metas/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('returns a file meta', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'meta-detail.txt',
            filename: 'meta-detail.txt',
            purpose: 'integration-test',
        })
        const meta = await FileMeta.create({
            file_id: file.id,
            name: 'category',
            value: 'detail',
        })

        const response = await api.get(`/api/files/${file.id}/metas/${meta.id}`)

        expect(response.body).toMatchObject({
            id: meta.id,
            file_id: file.id,
            name: 'category',
            value: 'detail',
        })
    })
})
