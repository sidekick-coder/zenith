import { beforeEach, describe, expect, it } from 'vitest'
import { config, http } from '@sidekick-coder/zenith-kit/server'
import { HttpTesterService } from '@sidekick-coder/zenith-kit/test'

describe('GET /api/pwa.json', () => {
    let api: HttpTesterService

    beforeEach(() => {
        api = new HttpTesterService({ http })
    })

    it('returns the default public manifest without authentication', async () => {
        config.set('site', {
            name: 'Manifest Site',
            description: 'Manifest description',
        })
        config.set('pwa', {})

        const response = await api.get('/api/pwa.json')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            name: 'Manifest Site',
            short_name: 'Manifest Site',
            description: 'Manifest description',
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#4f46e5',
            screenshots: [
                {
                    src: '/pwa-screenshot-01.png',
                    form_factor: 'wide',
                    sizes: '2160x1356',
                },
                {
                    src: '/pwa-screenshot-02.png',
                    sizes: '750x1334',
                },
            ],
            icons: [
                {
                    src: '/logo-128.png',
                    sizes: '128x128',
                    type: 'image/png',
                },
                {
                    src: '/logo-256.png',
                    sizes: '256x256',
                    type: 'image/png',
                },
                {
                    src: '/logo-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
        })
    })

    it('uses configured icons and screenshots', async () => {
        config.set('site', {
            name: 'Configured Manifest Site',
            description: 'Configured description',
        })
        config.set('pwa', {
            name: 'Configured PWA',
            shortName: 'Configured',
            description: 'Configured PWA description',
            startUrl: '/app',
            display: 'fullscreen',
            backgroundColor: '#000000',
            themeColor: '#ffffff',
            icons: [{
                fileId: 21,
                sizes: '192x192',
                type: 'image/png',
            }],
            screenshots: [{
                fileId: 22,
                formFactor: 'narrow',
                sizes: '750x1334',
            }],
        })

        const response = await api.get('/api/pwa.json')

        expect(response.body).toMatchObject({
            name: 'Configured PWA',
            short_name: 'Configured',
            description: 'Configured PWA description',
            start_url: '/app',
            display: 'fullscreen',
            background_color: '#000000',
            theme_color: '#ffffff',
            icons: [{
                src: '/api/files/21/stream',
                sizes: '192x192',
                type: 'image/png',
            }],
            screenshots: [{
                src: '/api/files/22/stream',
                form_factor: 'narrow',
                sizes: '750x1334',
            }],
        })
    })
})
