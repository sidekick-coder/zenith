import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drive, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('GET /api/drives/[driveId]/entries/show/[filename]', () => {
    const driveId = 'entries-show-get'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await drive.use(driveId).write('shown.txt', 'content')
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('returns a drive entry', async () => {
        const response = await api.get(`/api/drives/${driveId}/entries/show/shown.txt`)

        expect(response.body).toMatchObject({
            name: 'shown.txt',
            path: '/shown.txt',
            type: 'file',
        })
    })
})
