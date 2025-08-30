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
            if (record.path.startsWith('/admin')) {
                return [authGuard]
            }

            if (record.path.startsWith('/auth')) {
                return [guestGuard]
            }

            return []
        }
    })

    router.addRoute({
        path: '/admin',
        redirect: '/admin/users',
    })

    menu.add({
        id: 'users',
        label: $t('Users'),
        icon: 'UsersIcon',
        group: $t('General')
    })

    menu.add({
        id: 'users-list',
        label: $t('List'),
        to: '/admin/users',
        parent: 'users'
    })

    menu.add({
        id: 'storage',
        label: $t('Storage'),
        icon: 'DatabaseIcon',
        group: $t('General')
    })

    menu.add({
        id: 'storage-drives',
        label: $t('Drives'),
        to: '/admin/drives',
        parent: 'storage'
    })

    menu.add({
        id: 'modules',
        label: $t('Modules'),
        icon: 'PuzzleIcon',
        group: $t('General')
    })

    menu.add({
        id: 'modules-list',
        label: $t('List'),
        to: '/admin/modules',
        parent: 'modules'
    })
})