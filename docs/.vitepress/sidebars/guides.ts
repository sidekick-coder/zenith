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
                text: 'Setup',
                link: '/guides/installation/setup'
            },
            {
                text: 'Source Code',
                link: '/guides/installation/source-code'
            },
        ],
    },
    {
        text: 'Plugins',
        items: [
            {
                text: 'Introduction',
                link: '/guides/plugins/introduction'
            },
            {
                text: 'Creating a Plugin',
                link: '/guides/plugins/creating-a-plugin'
            }
        ]
    }
]
