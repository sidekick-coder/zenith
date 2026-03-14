import type { DefaultTheme } from 'vitepress'

export const modulesSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Modules',
        items: [
            {
                text: 'Introduction',
                link: '/modules/introduction'
            },
            {
                text: 'Build',
                link: '/modules/build'
            },
            {
                text: 'Cross module imports',
                link: '/modules/cross-module-imports'
            },
        ],
    },
    {
        text: 'Shared',
        items: [
            {
                text: 'Entities',
                link: '/modules/shared/entities'
            },
        ],
    },
    {
        text: 'Server',
        items: [
            {
                text: 'Entities',
                link: '/modules/server/entities'
            },
            {
                text: 'Migrations',
                link: '/modules/server/migrations'
            },
        ],
    },
    {
        text: 'Client',
        items: [
            {
                text: 'Entities',
                link: '/modules/client/entities'
            },
        ],
    },
]
