import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'
import { cleanupTestDrive, setupTestDrive } from '#tests/utils/drives.ts'

describe('GET /api/drives', () => {
    const driveId = 'drives-index-get'
    let api: HttpTesterService
    let directory: string

    beforeEach(async () => {
        api = new HttpTesterService({ http })
        directory = await setupTestDrive(driveId)
    })

    afterEach(() => cleanupTestDrive(directory))

    it('requires authentication', async () => {
        const response = await api.get('/api/drives')

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('lists configured drives', async () => {
        await api.loginByUsername('admin')

        const response = await api.get('/api/drives')

        expect(response.body.items).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: driveId,
                type: 'fs',
            }),
        ]))
    })
})
