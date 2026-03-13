import type { DefaultTheme } from 'vitepress'

export const guidesSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Guides',
        items: [
            {
                text: 'Docker',
                link: '/guides/installation/docker'
            },
            {
                text: 'Docker Compose',
                link: '/guides/installation/docker-compose'
            },
            {
                text: 'Setup',
                link: '/guides/installation/setup'
            },
            {
                text: 'Source Code',
                link: '/guides/installation/source-code'
            },
        ],
    },
]
