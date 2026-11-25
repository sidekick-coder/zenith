import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drive, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('DELETE /api/drives/[driveId]/entries/[filename]', () => {
    const driveId = 'entries-delete'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await drive.use(driveId).write('delete.txt', 'content')
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('deletes a drive entry', async () => {
        const response = await api.create(
            api.request.delete(`/api/drives/${driveId}/entries/delete.txt`)
        )

        expect(response.body).toEqual({ success: true })
        await expect(drive.use(driveId).exists('delete.txt')).resolves.toBe(false)
    })
})
