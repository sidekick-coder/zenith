
import type { DefaultTheme } from 'vitepress'

export const coreSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Introduction',
        items: [
            {
                text: 'Introduction',
                link: '/core/introduction'
            }
        ]
    },
    {
        text: 'Shared',
        items: [
            {
                text: 'Introduction',
                link: '/core/shared/introduction'
            },
            {
                text: 'Entities',
                link: '/core/shared/entities'
            },
            {
                text: 'Config',
                link: '/core/shared/config'
            },
            {
                text: 'DI',
                link: '/core/shared/di'
            },
            {
                text: 'Lifecycle',
                link: '/core/shared/lifecycle'
            },

        ],
    },
    {
        text: 'Server',
        items: [
            {
                text: 'Introduction',
                link: '/core/server/introduction'
            },
            {
                text: 'Entities',
                link: '/core/server/entities'
            },
            {
                text: 'DI',
                link: '/core/server/di'
            },
            {
                text: 'Config',
                link: '/core/server/config'
            },
            {
                text: 'Router',
                link: '/core/server/router'
            },
            {
                text: 'Migrations',
                link: '/core/server/migrations'
            },

        ],
    },
    {
        text: 'Client',
        items: [
            {
                text: 'Introduction',
                link: '/core/client/introduction'
            },
            {
                text: 'DI',
                link: '/core/client/di'
            },
            {
                text: 'Config',
                link: '/core/client/config'
            },
            {
                text: 'Entities',
                link: '/core/client/entities'
            },
            {
                text: 'Router',
                link: '/core/client/router'
            },

        ],
    },
]
