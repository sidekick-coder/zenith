import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('DELETE /api/drives/[id]', () => {
    const driveId = 'drives-delete'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('deletes a configured drive', async () => {
        const response = await api.create(
            api.request.delete(`/api/drives/${driveId}`)
        )

        expect(response.body).toEqual({ success: true })
        expect(config.get(`drive.disks.${driveId}`)).toBeUndefined()
    })
})
