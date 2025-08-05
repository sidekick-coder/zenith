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

    menu.add(
        {
            label: $t('Users'),
            icon: 'UsersIcon',
            children: [
                {
                    label: $t('List'),
                    to: '/admin/users',
                }
            ]
        },
        {
            label: $t('Advanced'),
            order: 900,
            group: true,
            items: [
                {
                    label: $t('Modules'),
                    to: '/admin/modules',
                    icon: 'PuzzleIcon',
                },
            ]
        }
    )
})