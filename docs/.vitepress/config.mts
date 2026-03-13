import { defineConfig } from 'vitepress'
import { guidesSidebar } from './sidebars/guides'
import { serverSidebar } from './sidebars/server'
import { clientSidebar } from './sidebars/client'
import { modulesSidebar } from './sidebars/modules'
import { ptBRSidebar } from './sidebars/pt-BR'

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
                        link: '/server/entrypoint'
                    },
                    {
                        text: 'Client',
                        link: '/client/entrypoint'
                    },
                ],
                sidebar: {
                    '/guides/': guidesSidebar,
                    '/server/': serverSidebar,
                    '/client/': clientSidebar,
                    '/modules/': modulesSidebar,
                },
            }
        },

        'pt-BR': {
            label: 'Português (Brasil)',
            lang: 'pt-BR',
            themeConfig: {
                nav: [
                    {
                        text: 'Início',
                        link: '/pt-BR/'
                    },
                ],
                sidebar: {
                    '/pt-BR/': ptBRSidebar,
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
