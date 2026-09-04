import { container, MenuService } from '@sidekick-coder/zenith-kit/client'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'

export default class extends LifecycleHook {
    public async load(): Promise<void> {
        const menu = container.get<MenuService>(MenuService)

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
