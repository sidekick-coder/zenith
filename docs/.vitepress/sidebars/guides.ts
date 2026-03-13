import type { DefaultTheme } from 'vitepress'

export const guidesSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Introduction',
        items: [
            {
                text: 'What is it?',
                link: '/guides/introduction/what-is-it'
            }
        ]
    },
    {
        text: 'Installation',
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
