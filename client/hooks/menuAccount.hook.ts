import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'

export default class MenuAccountLifecycleHook extends LifecycleHook {
    public async onLoad(): Promise<void> {
        const menu = useMenu()
        
        const layout = 'account-setting'

        menu.add({
            id: 'account-preferences',
            label: $t('Preferences'),
            to: '/admin/account/preferences',
            icon: 'UserCog',
            layout: layout,
            group: $t('Account')
        })

        menu.add({
            id: 'preferences-menu-items',
            label: $t('Items'),
            to: '/admin/menu/items',
            layout: layout,
            group: $t('Menu'),
        })
        
        menu.add({
            id: 'preferences-menu-groups',
            label: $t('Groups'),
            to: '/admin/menu/groups',
            layout: layout,
            group: $t('Menu'),
        })

        menu.add({
            id: 'preferences-menu-custom',
            label: $t('Custom'),
            to: '/admin/menu/custom',
            layout: layout,
            group: $t('Menu'),
        })
    }
}
