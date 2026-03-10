import { defineConfig } from 'vitepress'

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
                        text: 'Installation',
                        link: '/installation/docker'
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
                sidebar: [
                    {
                        text: 'Installation',
                        items: [
                            {
                                text: 'Docker',
                                link: '/installation/docker'
                            },
                            {
                                text: 'Docker Compose',
                                link: '/installation/docker-compose'
                            },
                            {
                                text: 'Setup',
                                link: '/installation/setup'
                            },
                            {
                                text: 'Source Code',
                                link: '/installation/source-code'
                            },
                        ],
                    },
                    {
                        text: 'Server',
                        items: [
                            {
                                text: 'Entrypoint',
                                link: '/server/entrypoint'
                            },
                            {
                                text: 'Routes',
                                link: '/server/routes'
                            },
                        ],
                    },
                    {
                        text: 'Client',
                        items: [
                            {
                                text: 'Entrypoint',
                                link: '/client/entrypoint'
                            },
                            {
                                text: 'Routes',
                                link: '/client/routes'
                            },
                            {
                                text: 'Setup',
                                link: '/client/setup'
                            },
                        ],
                    },
                    {
                        text: 'Modules',
                        items: [
                            {
                                text: 'Introduction',
                                link: '/modules/introduction'
                            },
                            {
                                text: 'Database',
                                link: '/modules/database'
                            },
                            {
                                text: 'Entities',
                                link: '/modules/entities'
                            },
                        ],
                    },
                ],
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
                sidebar: [
                    {
                        text: 'Introdução',
                        items: [
                            {
                                text: 'Início',
                                link: '/pt-BR/'
                            },
                        ],
                    },
                ],
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
