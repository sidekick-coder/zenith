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
                text: 'Container',
                link: '/guides/core/container'
            },
            {
                text: 'Logger',
                link: '/guides/core/logger'
            },
            {
                text: 'Events',
                link: '/guides/core/events'
            },
            {
                text: 'Drive',
                link: '/guides/core/drive'
            },
        ]
    },
    {
        text: 'Config',
        items: [
            {
                text: 'Config',
                link: '/guides/config/config'
            },
            {
                text: 'Config FS',
                link: '/guides/config/config-fs'
            },
            {
                text: 'Config S3',
                link: '/guides/config/config-s3'
            }
        ]
    },
    {
        text: 'Database',
        items: [
            {
                text: 'Database',
                link: '/guides/database/database'
            },
            {
                text: 'Migrations',
                link: '/guides/database/migrations'
            },
            {
                text: 'Database repository',
                link: '/guides/database/database-repository'
            },
            {
                text: 'User repository',
                link: '/guides/database/user-repository'
            },
        ]
    },
    {
        text: 'Router',
        items: [
            {
                text: 'Router',
                link: '/guides/router/router'
            },
            {
                text: 'Route files',
                link: '/guides/router/routes-files'
            },
            {
                text: 'Route FS routing',
                link: '/guides/router/routes-fs-routing'
            },
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
        ]
    }
]
