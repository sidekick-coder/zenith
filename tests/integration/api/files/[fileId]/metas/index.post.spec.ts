import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'

describe('POST /api/files/[fileId]/metas', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('creates a file meta', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'meta-create.txt',
            filename: 'meta-create.txt',
            purpose: 'integration-test',
        })

        const response = await api.post(`/api/files/${file.id}/metas`, {
            name: 'category',
            value: 'created',
        })

        expect(response.body).toMatchObject({
            file_id: file.id,
            name: 'category',
            value: 'created',
        })

        await expect(FileMeta.findOne({ where: eb => eb('id', '=', response.body.id), }))
            .resolves.toMatchObject({ value: 'created', })
    })
})
