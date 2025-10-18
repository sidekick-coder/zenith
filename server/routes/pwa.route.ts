import config from '#server/facades/config.facade.ts'
import rootRouter from '#server/facades/router.facade.ts'
import validator from '#shared/services/validator.service.ts'
import authMiddleware from '#server/middlewares/auth.middleware.ts'
import server from '#server/facades/server.facade.ts'
import drive from '#server/facades/drive.facade.ts'
import schemas from '#shared/validators/index.ts'

const router = rootRouter.prefix('/api/pwa')
    .use(authMiddleware)
    .group()

async function generateManifestFromConfig() {
    const pwaSettings = config.get('pwa', {})
    const siteSettings = {
        name: config.get('site.name', 'Zenith'),
        description: config.get('site.description', 'Zenith Admin Panel')
    }

    // Process icons with file URLs
    const icons = []
    for (const icon of pwaSettings.icons || []) {
        icons.push({
            src: `/api/files/${icon.fileId}/stream`,
            sizes: icon.sizes,
            type: icon.type
        })
    } 

    if (icons.length === 0) {
        icons.push(
            { 
                src: '/logo-128.png', 
                sizes: '128x128', 
                type: 'image/png' 
            },
            { 
                src: '/logo-256.png', 
                sizes: '256x256', 
                type: 'image/png' 
            },
            { 
                src: '/logo-512.png', 
                sizes: '512x512', 
                type: 'image/png' 
            }
        )
    }

    // Process screenshots with file URLs
    const screenshots = []
    if (pwaSettings.screenshots && Array.isArray(pwaSettings.screenshots)) {
        for (const screenshot of pwaSettings.screenshots) {
            const processedScreenshot = { ...screenshot }
            if (screenshot.fileId) {
                processedScreenshot.src = await drive.url(screenshot.fileId)
            }
            if (!processedScreenshot.src) {
                processedScreenshot.src = screenshot.src || '/pwa-screenshot-01.png'
            }
            screenshots.push(processedScreenshot)
        }
    } else {
        // Default screenshots
        screenshots.push(
            { 
                src: '/pwa-screenshot-01.png', 
                form_factor: 'wide', 
                sizes: '2160x1356' 
            },
            { 
                src: '/pwa-screenshot-02.png', 
                sizes: '750x1334' 
            }
        )
    }

    return {
        name: pwaSettings.name || siteSettings.name,
        short_name: pwaSettings.shortName || siteSettings.name,
        description: pwaSettings.description || siteSettings.description,
        start_url: pwaSettings.startUrl || '/',
        display: pwaSettings.display || 'standalone',
        background_color: pwaSettings.backgroundColor || '#ffffff',
        theme_color: pwaSettings.themeColor || '#4f46e5',
        screenshots,
        icons
    }
}

// API endpoints for PWA settings management
router.get('/', async () => {
    return config.get('pwa', {})
})

router.put('/', async ({ body }) => {
    const payload = validator.validate(body, schemas.pwa.update)

    config.set('pwa', payload)

    return config.get('pwa', {})
})

// Public manifest endpoint
rootRouter.get('/pwa.json', async () => {
    return await generateManifestFromConfig()
})