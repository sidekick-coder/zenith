import { beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import File from '#server/entities/file.entity.ts'

describe('GET /api/files/[id]', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        await api.loginByUsername('admin')
    })

    it('returns a file', async () => {
        const file = await File.create({
            public: 0,
            drive: 'local',
            mimetype: 'text/plain',
            client_name: 'files-detail.txt',
            filename: 'files-detail.txt',
            purpose: 'integration-test',
        })

        const response = await api.get(`/api/files/${file.id}`)

        expect(response.body).toMatchObject({
            id: file.id,
            client_name: 'files-detail.txt',
            filename: 'files-detail.txt',
            purpose: 'integration-test',
        })
    })
})
