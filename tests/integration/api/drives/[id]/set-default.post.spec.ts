import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('POST /api/drives/[id]/set-default', () => {
    const driveId = 'drives-default'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('sets the default drive', async () => {
        const response = await api.post(`/api/drives/${driveId}/set-default`)

        expect(response.status).toBe(200)
        expect(config.get('drive.default')).toBe(driveId)
    })
})
