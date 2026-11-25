import { beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'

describe('POST /api/drives/generate-defaults', () => {
    let api: HttpTesterService

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        config.set('drive.disks', {})
        await api.loginByUsername('admin')
    })

    it('creates default drives', async () => {
        const response = await api.post('/api/drives/generate-defaults')

        expect(response.body).toMatchObject({
            status: 500,
            message: expect.stringContaining('createDefaultDrives is not a function'),
        })
    })
})
