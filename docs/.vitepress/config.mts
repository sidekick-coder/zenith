import { defineConfig } from 'vitepress'
import { guidesSidebar } from './sidebars/guides.ts'
import { serverSidebar } from './sidebars/server.ts'
import { clientSidebar } from './sidebars/client.ts'
import { modulesSidebar } from './sidebars/modules.ts'
import { sharedSidebar } from './sidebars/shared.ts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Zenith',
    description: 'A CMS to conquer it all',
    locales: {
        root: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                nav: [
                    {
                        text: 'Home',
                        link: '/'
                    },
                    {
                        text: 'Guides',
                        link: '/guides/installation/docker'
                    },
                    {
                        text: 'Server',
                        link: '/server/introduction'
                    },
                    {
                        text: 'Client',
                        link: '/client/introduction'
                    },
                    {
                        text: 'Shared',
                        link: '/shared/introduction'
                    },
                ],
                sidebar: {
                    '/guides/': guidesSidebar,
                    '/server/': serverSidebar,
                    '/client/': clientSidebar,
                    '/modules/': modulesSidebar,
                    '/shared/': sharedSidebar,
                },
            }
        },
    },

    themeConfig: {
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/sidekick-coder/zenith'
            }
        ]
    }
})
