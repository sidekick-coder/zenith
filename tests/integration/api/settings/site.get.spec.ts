import { beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'

describe('GET /api/settings/site', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.get('/api/settings/site')

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('returns the site settings', async () => {
        const site = {
            name: 'Integration Test Site',
            description: 'Site settings GET test',
        }

        config.set('site', site)
        await api.loginByUsername('admin')

        const response = await api.get('/api/settings/site')

        expect(response.body).toEqual(site)
    })
})
