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
        text: 'Core',
        items: [
            {
                text: 'Config FS',
                link: '/guides/core/config-fs'
            },
            {
                text: 'Config S3',
                link: '/guides/core/config-s3'
            }
        ]

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
            },
            {
                text: 'Container',
                link: '/guides/plugins/container'
            },
            {
                text: 'Config',
                link: '/guides/plugins/config'
            },
            {
                text: 'Events',
                link: '/guides/plugins/events'
            },
            {
                text: 'Routes',
                link: '/guides/plugins/routes'
            },
            {
                text: 'Route files',
                link: '/guides/plugins/route-files'
            },
            {
                text: 'Route file system based routing',
                link: '/guides/plugins/route-file-system-based-routing'
            }
        ]
    }
]
