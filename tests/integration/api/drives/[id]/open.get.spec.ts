import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drive, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('GET /api/drives/[id]/open/[filename]', () => {
    const driveId = 'drives-open-get'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await drive.use(driveId).write('open.txt', 'content')
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('redirects to a drive file URL', async () => {
        const response = await api.get(`/api/drives/${driveId}/open/open.txt`)

        expect(response.status).toBe(302)
        expect(response.headers.location).toContain(`/api/drives/${driveId}/stream/open.txt`)
    })
})
