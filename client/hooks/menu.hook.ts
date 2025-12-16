import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import config from '#client/facades/config.facade.ts'

const menu = useMenu()

export default class MenuLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        menu.clear()
    }

    public async onLoad(): Promise<void> {
        // menu.add({
        //     id: 'account-preferences',
        //     label: $t('Preferences'),
        //     to: '/admin/account/preferences',
        //     icon: 'UserCog',
        //     layout: 'account-setting',
        //     group: $t('General')
        // })

        // menu.add({
        //     id: 'preferences-menu-items',
        //     label: $t('Items'),
        //     to: '/admin/menu/items',
        //     layout: 'setting',
        //     group: $t('Menu'),
        // })
        
        // menu.add({
        //     id: 'preferences-menu-groups',
        //     label: $t('Groups'),
        //     to: '/admin/menu/groups',
        //     layout: 'setting',
        //     group: $t('Menu'),
        // })

        // menu.add({
        //     id: 'preferences-menu-custom',
        //     label: $t('Custom'),
        //     to: '/admin/menu/custom',
        //     layout: 'setting',
        //     group: $t('Menu'),
        // })

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

    }
    
    public async onBoot(): Promise<void> {
        config.get<string>('menu.hide', '').split(',')
            .map((s: string) => s.trim())
            .forEach(id => menu.remove(id))
    }
}
