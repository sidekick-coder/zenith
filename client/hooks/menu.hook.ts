import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import config from '#client/facades/config.facade.ts'


export default class MenuLifecycleHook extends LifecycleHook {
    public async onLoad(): Promise<void> {
        const menu = useMenu()

        menu.clear()

        menu.add({
            id: 'account-preferences',
            label: $t('Preferences'),
            to: '/admin/account/preferences',
            icon: 'UserCog',
            layout: 'setting',
            group: $t('General')
        })

        menu.add({
            id: 'preferences-menu-items',
            label: $t('Items'),
            to: '/admin/menu/items',
            layout: 'setting',
            group: $t('Menu'),
        })
        
        menu.add({
            id: 'preferences-menu-groups',
            label: $t('Groups'),
            to: '/admin/menu/groups',
            layout: 'setting',
            group: $t('Menu'),
        })

        menu.add({
            id: 'preferences-menu-custom',
            label: $t('Custom'),
            to: '/admin/menu/custom',
            layout: 'setting',
            group: $t('Menu'),
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
            label: $t('Authentication'),
            icon: 'Lock',
            group: $t('General'),
            layout: 'setting',
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
            group: $t('General'),
            layout: 'setting',
        })

        menu.add({
            id: 'system-routes',
            label: $t('Routes'),
            icon: 'Settings',
            layout: 'setting',
            group: $t('General'),
            to: '/admin/settings/site'
        })

        menu.add({
            id: 'branding',
            label: $t('Branding'),
            icon: 'Palette',
            layout: 'setting',
            group: $t('General'),
            to: '/admin/settings/branding'
        })

        menu.add({
            id: 'pwa',
            group: $t('General'),
            label: $t('PWA'),
            icon: 'Tablet',
            layout: 'setting',
            to: '/admin/settings/pwa'
        })
        
        menu.add({
            id: 'translator-general',
            group: $t('Translator'),
            label: $t('General'),
            layout: 'setting',
            to: '/admin/translator/general'
        })

        const hide = config.get<string>('menu.hide', '').split(',')
            .map((s: string) => s.trim())

        hide.forEach(id => menu.remove(id))
    }
}
