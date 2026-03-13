import type { DefaultTheme } from 'vitepress'

export const serverSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Server',
        items: [
            {
                text: 'Introduction',
                link: '/server/introduction'
            },
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
        text: 'Services',
        items: [
            {
                text: 'DI',
                link: '/server/services/di'
            },
            {
                text: 'Config',
                link: '/server/services/config'
            },
            {
                text: 'Router',
                link: '/server/services/router'
            },
        ],
    },
]
