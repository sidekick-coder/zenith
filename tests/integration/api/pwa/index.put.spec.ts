import { beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'

describe('PUT /api/pwa', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.create(
            api.request.put('/api/pwa').send({ name: 'Unauthorized PWA' })
        )

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('updates and returns the PWA settings', async () => {
        const pwa = {
            name: 'Updated Integration PWA',
            shortName: 'Updated PWA',
            description: 'PWA update test',
            startUrl: '/dashboard',
            display: 'standalone',
            backgroundColor: '#ffffff',
            themeColor: '#4f46e5',
            icons: [{
                fileId: 12,
                sizes: '512x512',
                type: 'image/png',
            }],
            screenshots: [{
                fileId: 13,
                formFactor: 'wide',
                sizes: '2160x1356',
            }],
        }

        await api.loginByUsername('admin')

        const response = await api.create(
            api.request.put('/api/pwa').send(pwa)
        )

        expect(response.body).toEqual(pwa)
        expect(config.get('pwa')).toEqual(pwa)
    })
})
