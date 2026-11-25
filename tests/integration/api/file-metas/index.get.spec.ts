import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'
import FileMeta from '#server/entities/fileMeta.entity.ts'

describe('GET /api/file-metas', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get('/api/file-metas')

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists file metas with filters', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'global-metas.txt',
            filename: 'global-metas.txt',
            purpose: 'integration-test',
        })
        const meta = await FileMeta.create({
            file_id: file.id,
            name: 'category',
            value: 'global',
        })

        await api.loginByUsername('admin')

        const response = await api.get(`/api/file-metas?file_id=${file.id}&name=category`)

        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: meta.id,
                file_id: file.id,
                name: 'category',
                value: 'global',
            }),
        ]))
    })
})
