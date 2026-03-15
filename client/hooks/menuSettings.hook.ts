import menu from '#client/facades/menu.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class MenuSettingLifecycleHook extends LifecycleHook {
    public async onLoad(): Promise<void> {
        menu.add({
            id: 'site-general',
            label: $t('General'),
            layout: 'setting',
            group: $t('Site'),
            to: '/admin/settings/site/general'
        })

        menu.add({
            id: 'site-colors',
            label: $t('Colors'),
            layout: 'setting',
            group: $t('Site'),
            to: '/admin/settings/site/colors'
        })

        menu.add({
            id: 'settings-site-pwa',
            group: $t('Site'),
            label: $t('PWA'),
            icon: 'Tablet',
            layout: 'setting',
            to: '/admin/settings/site/pwa'
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
            id: 'translator-general',
            group: $t('Translator'),
            label: $t('General'),
            layout: 'setting',
            to: '/admin/translator/general'
        })

    }
}
