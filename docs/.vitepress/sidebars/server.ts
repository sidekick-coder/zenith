import type { DefaultTheme } from 'vitepress'

export const serverSidebar: DefaultTheme.SidebarItem[] = [
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
]
