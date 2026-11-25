import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('PUT /api/drives/[id]', () => {
    const driveId = 'drives-update-put'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
        await api.loginByUsername('admin')
    })

    afterEach(() => cleanupTestDrive(directory))

    it('updates a configured drive', async () => {
        const payload = {
            name: 'Updated Drive',
            config: { directory, },
        }

        const response = await api.create(
            api.request.put(`/api/drives/${driveId}`).send(payload)
        )

        expect(response.body).toMatchObject({
            id: driveId,
            ...payload,
        })
        expect(config.get(`drive.disks.${driveId}`)).toMatchObject(payload)
    })
})
