import { describe, expect, it } from 'vitest'
import { http, HttpTesterService } from '@sidekick-coder/zenith-kit/server'

describe('GET /api/health', () => {
    const api = new HttpTesterService({ http })

    it('should return 200 OK', async () => {
        const response = await api.get('/api/health')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: 'ok' })
    })
})
