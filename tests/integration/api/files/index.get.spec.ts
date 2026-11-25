import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'

describe('GET /api/files', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get('/api/files')

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists files', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'files-list.txt',
            filename: 'files-list.txt',
            purpose: 'integration-test',
        })

        await api.loginByUsername('admin')

        const response = await api.get('/api/files?page=1&limit=100')

        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: file.id,
                client_name: 'files-list.txt',
                purpose: 'integration-test',
            }),
        ]))
    })
})
