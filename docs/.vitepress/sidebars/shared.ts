import type { DefaultTheme } from 'vitepress'

export const sharedSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Shared',
        items: [
            {
                text: 'Introduction',
                link: '/shared/introduction'
            },
        ],
    },
    {
        text: 'Services',
        items: [
            {
                text: 'Config',
                link: '/shared/config'
            },
        ],
    },
]
