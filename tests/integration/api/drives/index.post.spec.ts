import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('POST /api/drives', () => {
    const driveId = 'drives-create-post'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('creates a configured drive', async () => {
        const payload = {
            id: 'created-drive',
            name: 'Created Drive',
            type: 'fs',
            config: { directory },
        }

        const response = await api.post('/api/drives', payload)

        expect(response.body).toEqual({ message: 'Resource created successfully' })
        expect(config.get('drive.disks.created-drive')).toMatchObject({
            name: payload.name,
            type: payload.type,
            config: payload.config,
        })
    })
})
