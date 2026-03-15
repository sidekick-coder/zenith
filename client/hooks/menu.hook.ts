import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import config from '#client/facades/config.facade.ts'
import menu from '#client/facades/menu.facade.ts'


export default class MenuLifecycleHook extends LifecycleHook {
    public async onLoad(): Promise<void> {
        menu.add({
            id: 'users',
            layout: 'admin',
            label: $t('Users'),
            to: '/admin/users',
            icon: 'Users',
            group: $t('Auth')
        })

        menu.add({
            id: 'roles',
            layout: 'admin',
            label: $t('Roles'),
            to: '/admin/roles',
            icon: 'Users',
            group: $t('Auth')
        })

        menu.add({
            id: 'permissions',
            layout: 'admin',
            label: $t('Permissions'),
            to: '/admin/permissions',
            icon: 'Users',
            group: $t('Auth')
        })

        
        menu.add({
            id: 'drives',
            layout: 'admin',
            label: $t('Drives'),
            to: '/admin/drives',
            icon: 'Folder',
            group: $t('Storage')
        })

        menu.add({
            id: 'files',
            layout: 'admin',
            label: $t('Files'),
            to: '/admin/files',
            icon: 'File',
            group: $t('Storage')
        })
        
        menu.add({
            id: 'mailer-gateways',
            layout: 'admin',
            label: $t('Mailers'),
            to: '/admin/mailers',
            icon: 'Mail',
            group: $t('Mail')
        })
        
        menu.add({
            id: 'mailer-templates',
            layout: 'admin',
            label: $t('Templates'),
            to: '/admin/email-templates',
            icon: 'Mail',
            group: $t('Mail')
        })

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
        config.get<string>('menu.hide', '').split(',')
            .map((s: string) => s.trim())
            .forEach(id => menu.remove(id))
    }
}
