import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import config from '#client/facades/config.facade.ts'

const menu = useMenu()

export default class MenuLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        menu.clear()
    }

    public async onLoad(): Promise<void> {
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
        
        menu.add({
            id: 'mailer-gateways',
            label: $t('Mailers'),
            to: '/admin/mailers',
            icon: 'Mail',
            group: $t('Mail')
        })
        
        menu.add({
            id: 'mailer-templates',
            label: $t('Templates'),
            to: '/admin/email-templates',
            icon: 'Mail',
            group: $t('Mail')
        })

        menu.add({
            id: 'module-all',
            label: $t('All'),
            to: '/admin/modules',
            icon: 'Puzzle',
            group: $t('Modules'),
            // layout: 'admin',
        })

    }
    
    public async onBoot(): Promise<void> {
        config.get<string>('menu.hide', '').split(',')
            .map((s: string) => s.trim())
            .forEach(id => menu.remove(id))
    }
}
