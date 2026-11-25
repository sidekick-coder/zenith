import { beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'

describe('PUT /api/settings/site', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('requires authentication', async () => {
        const response = await api.create(
            api.request.put('/api/settings/site').send({ name: 'Unauthorized' })
        )

        expect(response.body).toMatchObject({ status: 401 })
    })

    it('updates and returns the site settings', async () => {
        const site = {
            name: 'Updated Integration Test Site',
            description: 'Site settings PUT test',
        }

        await api.loginByUsername('admin')

        const response = await api.create(
            api.request.put('/api/settings/site').send(site)
        )

        expect(response.body).toEqual(site)
        expect(config.get('site')).toEqual(site)
    })
})
