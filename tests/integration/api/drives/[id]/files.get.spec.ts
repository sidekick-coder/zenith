import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drive, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('GET /api/drives/[id]/files', () => {
    const driveId = 'drives-files-get'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await drive.use(driveId).write('listed.txt', 'content')
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('lists files in a drive', async () => {
        const response = await api.get(`/api/drives/${driveId}/files`)

        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: 'listed.txt',
                type: 'file',
            }),
        ]))
    })
})
