import { beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'

describe('GET /api/pwa', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get('/api/pwa')

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('returns the PWA settings', async () => {
        const pwa = {
            name: 'Integration PWA',
            shortName: 'PWA',
            display: 'standalone',
        }

        config.set('pwa', pwa)
        await api.loginByUsername('admin')

        const response = await api.get('/api/pwa')

        expect(response.body).toEqual(pwa)
    })
})
