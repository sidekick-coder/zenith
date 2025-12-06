import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import auth from '#client/facades/auth.facade.ts'
import config from '#client/facades/config.facade.ts'
import { $t } from '#shared/lang.ts'

export default class MenuLifecycleHook extends LifecycleHook {
    public async onLoad(): Promise<void> {
        const menu = useMenu()

        menu.clear()

        if (auth.user) {
            menu.add({
                id: 'account-profile',
                label: $t('Profile'),
                to: `/admin/users/${auth.user.id}`,
                icon: 'User',
                group: $t('Account')
            })
        }

        menu.add({
            id: 'account-preferences',
            label: $t('Preferences'),
            to: '/admin/account/preferences',
            icon: 'UserCog',
            group: $t('Account')
        })

        menu.add({
            id: 'users',
            label: $t('Users'),
            to: '/admin/users',
            icon: 'Users',
            group: $t('Auth')
        })

        menu.add({
            id: 'roles',
            label: $t('Roles'),
            to: '/admin/roles',
            icon: 'Users',
            group: $t('Auth')
        })

        menu.add({
            id: 'permissions',
            label: $t('Permissions'),
            to: '/admin/permissions',
            icon: 'Users',
            group: $t('Auth')
        })

        menu.add({
            id: 'auth-settings',
            label: $t('Settings'),
            icon: 'Lock',
            group: $t('Auth'),
            to: '/admin/settings/auth'
        })

        menu.add({
            id: 'drives',
            label: $t('Drives'),
            to: '/admin/drives',
            icon: 'Folder',
            group: $t('Storage')
        })

        menu.add({
            id: 'files',
            label: $t('Files'),
            to: '/admin/files',
            icon: 'File',
            group: $t('Storage')
        })

        menu.add({
            id: 'modules',
            label: $t('Modules'),
            to: '/admin/modules',
            icon: 'Puzzle',
            group: $t('Settings'),
        })

        menu.add({
            id: 'system-routes',
            label: $t('Routes'),
            icon: 'Settings',
            group: $t('System'),
            to: '/admin/settings/site'
        })

        menu.add({
            id: 'branding',
            label: $t('Branding'),
            icon: 'Palette',
            group: $t('System'),
            to: '/admin/settings/branding'
        })

        menu.add({
            id: 'pwa',
            group: $t('System'),
            label: $t('PWA'),
            icon: 'Tablet',
            to: '/admin/settings/pwa'
        })

        const hide = config.get<string>('menu.hide', '').split(',')
            .map((s: string) => s.trim())

        hide.forEach(id => menu.remove(id))
    }
}
