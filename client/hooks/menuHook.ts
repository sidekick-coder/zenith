import { container, config, MenuService } from '@sidekick-coder/zenith-kit/client'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

export default class extends LifecycleHook {
    public async register(): Promise<void> {
        const menu = new MenuService()

        container.set(MenuService, menu)

        // dashboard 
        menu.add({
            layout: 'admin',
            label: $t('Dashboards'),
            to: '/admin/dashboards',
            icon: 'LayoutDashboard',
            group: $t('Dashboards')
        })

        // auth
        menu.add({
            layout: 'admin',
            label: $t('Users'),
            to: '/admin/users',
            icon: 'Users',
            group: $t('Auth')
        })

        menu.add({
            layout: 'admin',
            label: $t('Roles'),
            to: '/admin/roles',
            icon: 'Shield',
            group: $t('Auth')
        })

        menu.add({
            layout: 'admin',
            label: $t('Permissions'),
            to: '/admin/permissions',
            icon: 'Lock',
            group: $t('Auth')
        })

        menu.add({
            label: $t('Design'),
            group: $t('Auth'),
            layout: 'admin',
            icon: 'Palette',
            to: '/admin/settings/auth/layout'
        })

        menu.add({
            label: $t('OAuth'),
            group: $t('Auth'),
            layout: 'admin',
            icon: 'Key',
            to: '/admin/settings/auth/oauth'
        })

        menu.add({
            label: $t('Tokens'),
            group: $t('Auth'),
            layout: 'admin',
            icon: 'Key',
            to: '/admin/tokens'
        })

        menu.add({
            label: $t('Settings'),
            group: $t('Auth'),
            layout: 'admin',
            icon: 'Settings',
            to: '/admin/settings/auth/general'
        })

        // storage
        menu.add({
            layout: 'admin',
            label: $t('Drives'),
            to: '/admin/drives',
            icon: 'Folder',
            group: $t('Storage')
        })

        menu.add({
            layout: 'admin',
            label: $t('Files'),
            to: '/admin/files',
            icon: 'File',
            group: $t('Storage')
        })

        // mail
        menu.add({
            layout: 'admin',
            label: $t('Mailers'),
            to: '/admin/mailers',
            icon: 'Mail',
            group: $t('Mail')
        })

        menu.add({
            layout: 'admin',
            label: $t('Templates'),
            to: '/admin/email-templates',
            icon: 'Mail',
            group: $t('Mail')
        })

        // database 
        menu.add({
            layout: 'admin',
            label: $t('Migrations'),
            to: '/admin/migrations',
            icon: 'Database',
            group: $t('Database')
        })

        menu.add({
            layout: 'admin',
            label: $t('Seeders'),
            to: '/admin/seeders',
            icon: 'Database',
            group: $t('Database')
        })


        // site
        menu.add({
            label: $t('General'),
            layout: 'admin',
            group: $t('Site'),
            icon: 'Settings',
            to: '/admin/settings/site/general'
        })

        menu.add({
            label: $t('Colors'),
            layout: 'admin',
            group: $t('Site'),
            icon: 'Palette',
            to: '/admin/settings/site/colors'
        })

        menu.add({
            group: $t('Site'),
            label: $t('PWA'),
            icon: 'Tablet',
            layout: 'admin',
            to: '/admin/settings/site/pwa'
        })

        menu.add({
            group: $t('Others'),
            label: $t('Translator'),
            layout: 'admin',
            to: '/admin/translator/general'
        })

        menu.add({
            group: $t('Others'),
            label: $t('Webhook senders'),
            layout: 'admin',
            to: '/admin/webhook-senders',
        })

        menu.add({
            layout: 'admin',
            label: $t('Plugins'),
            to: '/admin/plugins',
            icon: 'Puzzle',
            group: $t('Plugins'),
        })

    }

    public async onBoot(): Promise<void> {
        const menu = container.get<MenuService>(MenuService)

        config.get<string>('menu.hide', '').split(',')
            .map((s: string) => s.trim())
            .forEach(id => menu.remove(id))
    }
}
