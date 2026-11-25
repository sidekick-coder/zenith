import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('GET /api/drives/[id]', () => {
    const driveId = 'drives-detail-get'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('returns a configured drive', async () => {
        const response = await api.get(`/api/drives/${driveId}`)

        expect(response.body).toMatchObject({
            id: driveId,
            type: 'fs',
            name: 'Integration Test Drive',
        })
    })
})
