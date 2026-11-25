import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'

describe('GET /api/files/[fileId]/metas', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('lists metas for a file', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'nested-metas.txt',
            filename: 'nested-metas.txt',
            purpose: 'integration-test',
        })
        const meta = await FileMeta.create({
            file_id: file.id,
            name: 'category',
            value: 'nested',
        })

        const response = await api.get(`/api/files/${file.id}/metas`)

        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: meta.id,
                file_id: file.id,
                name: 'category',
                value: 'nested',
            }),
        ]))
    })
})
