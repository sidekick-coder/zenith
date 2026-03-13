import type { DefaultTheme } from 'vitepress'

export const clientSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Client',
        items: [
            {
                text: 'Introduction',
                link: '/client/introduction'
            },
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
        text: 'Services',
        items: [
            {
                text: 'Config',
                link: '/client/services/config'
            },
            {
                text: 'DI',
                link: '/client/services/di'
            },
            {
                text: 'Router',
                link: '/client/services/router'
            },
        ],
    },
]
