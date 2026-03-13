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
                text: 'Database',
                link: '/modules/database'
            },
            {
                text: 'Entities',
                link: '/modules/entities'
            },
        ],
    },
]
