import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drive, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('GET /api/drives/[driveId]/entries', () => {
    const driveId = 'entries-index-get'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await drive.use(driveId).write('entry.txt', 'content')
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('lists drive entries', async () => {
        const response = await api.get(`/api/drives/${driveId}/entries`)

        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'entry.txt',
                type: 'file',
            }),
        ]))
    })
})
