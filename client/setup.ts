import type { DefineComponent } from 'vue'
import { defineClientSetup } from './utils/defineClientSetup'
import authGuard from './guards/auth.guard'
import guestGuard from './guards/guest.guard'
import setupGuard from './guards/setup.guard'
import { $t } from '#shared/lang.ts'

export default defineClientSetup(({ menu, router }) => {
    router.beforeEach(setupGuard)

    router.auto(import.meta.glob<DefineComponent>('./pages/**/*.vue',), {
        strip: ['pages'],
        guards: record => {
            
            if (record.path === '/admin/auth/login') {
                return [guestGuard]
            }

            if (record.path.startsWith('/admin')) {
                return [authGuard]
            }

            return []
        }
    })

    router.addRoute({
        path: '/admin',
        redirect: '/admin/users',
    })

    menu.add({
        id: 'account-profile',
        label: $t('Profile'),
        to: '/admin/account/profile',
        icon: 'User',
        group: $t('Account')
    })

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
        icon: 'List',
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
        id: 'site',
        label: $t('Site'),
        icon: 'Settings',
        group: $t('Settings'),
        to: '/admin/settings/site'
    })
    
    menu.add({
        id: 'branding',
        label: $t('Branding'),
        icon: 'Palette',
        group: $t('Settings'),
        to: '/admin/settings/branding'
    })
    
    menu.add({
        id: 'settings-auth',
        label: $t('Auth'),
        icon: 'Lock',
        group: $t('Settings'),
        to: '/admin/settings/auth'
    })

    menu.add({
        id: 'pwa',
        group: $t('Settings'),
        label: $t('PWA'),
        icon: 'Tablet',
        to: '/admin/settings/pwa'
    })
})