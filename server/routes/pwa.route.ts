import config from '#server/facades/config.facade.ts'
import router from '#server/facades/router.facade.ts'

router.get('/pwa.json', async () => {
    return {
        'name': config.get('site.name', 'Zenith'),
        'short_name': config.get('site.name', 'Zenith'),
        'description': config.get('site.description', 'Zenith Admin Panel'),
        'start_url': '/',
        'display': 'standalone',
        'background_color': '#ffffff',
        'theme_color': '#4f46e5',
        'screenshots': [
            {
                'src': '/pwa-screenshot-01.png',
                'form_factor': 'wide',
                'sizes': '2160x1356'
            }
        ],
        'icons': [
            {
                'src': '/logo-128.png',
                'sizes': '128x128',
                'type': 'image/png'
            },
            {
                'src': '/logo-256.png',
                'sizes': '256x256',
                'type': 'image/png'
            },
            {
                'src': '/logo-512.png',
                'sizes': '512x512',
                'type': 'image/png'
            }
        ]
    }
})