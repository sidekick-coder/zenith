import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'

export default class MenuSettingLifecycleHook extends LifecycleHook {
    public async onLoad(): Promise<void> {
        const menu = useMenu()
        
        const layout = 'setting'

        menu.add({
            id: 'auth-settings',
            label: $t('Authentication'),
            icon: 'Lock',
            group: $t('General'),
            layout: layout,
            to: '/admin/settings/auth'
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

    }
}
