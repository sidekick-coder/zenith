import type { DefaultTheme } from 'vitepress'

export const clientSidebar: DefaultTheme.SidebarItem[] = [
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
]
