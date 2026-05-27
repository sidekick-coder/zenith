import { defineConfig } from 'vitepress'
import { guidesSidebar } from './sidebars/guides.ts'
import { coreSidebar } from './sidebars/core.ts'
import { modulesSidebar } from './sidebars/modules.ts'
import { nav } from './nav.ts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Zenith',
    description: 'A CMS to conquer it all',
    lang: 'en-US',
    head: [
        ['link', {
            rel: 'icon',
            href: '/favicon.ico'
        }]
    ],
    locales: {
        root: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                nav,
                sidebar: {
                    '/guides/': guidesSidebar,
                    // '/core/': coreSidebar,
                    // '/modules/': modulesSidebar,
                },
            }
        },
    },
    themeConfig: {
        search: { provider: 'local' },
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/sidekick-coder/zenith'
            }
        ]
    }
})
