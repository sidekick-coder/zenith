import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'

export default class MenuSettingLifecycleHook extends LifecycleHook {
    public async onLoad(): Promise<void> {
        const menu = useMenu()

        menu.add({
            id: 'system-routes',
            label: $t('Routes'),
            icon: 'Settings',
            layout: 'setting',
            group: $t('General'),
            to: '/admin/settings/site'
        })

        menu.add({
            id: 'settings-auth-general',
            label: $t('General'),
            group: $t('Authentication'),
            layout: 'setting',
            to: '/admin/settings/auth/general'
        })
        
        menu.add({
            id: 'settings-auth-layout',
            label: $t('Layout'),
            group: $t('Authentication'),
            layout: 'setting',
            to: '/admin/settings/auth/layout'
        })

        menu.add({
            id: 'settings-auth-oauth',
            label: $t('OAuth'),
            group: $t('Authentication'),
            layout: 'setting',
            to: '/admin/settings/auth/oauth'
        })

        menu.add({
            id: 'site-general',
            label: $t('General'),
            layout: 'setting',
            group: $t('Site'),
            to: '/admin/site/general'
        })
        

        menu.add({
            id: 'site-colors',
            label: $t('Colors'),
            layout: 'setting',
            group: $t('Site'),
            to: '/admin/site/colors'
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
