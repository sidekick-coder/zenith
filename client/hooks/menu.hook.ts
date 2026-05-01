import { container, MenuService } from '@sidekick-coder/zenith-kit/client'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class MenuLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        const menu = new MenuService()

        container.set(MenuService, menu)
    }

    public async onLoad(): Promise<void> {
        const menu = container.get<MenuService>(MenuService)

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
            id: 'translator-general',
            group: $t('Translator'),
            label: $t('General'),
            layout: 'admin',
            to: '/admin/translator/general'
        })

        // modules
        menu.add({
            id: 'module-all',
            layout: 'admin',
            label: $t('All'),
            to: '/admin/modules',
            icon: 'Puzzle',
            group: $t('Modules'),
        })
    }
    
    public async onBoot(): Promise<void> {
        // const menu = container.get<MenuService>(MenuService)
        //
        // // config.get<string>('menu.hide', '').split(',')
        //     .map((s: string) => s.trim())
        //     .forEach(id => menu.remove(id))
    }
}
