import type { LayoutMenuItem } from '#client/layouts/Dashboard.vue'
import { $t } from '#shared/lang.ts'

const menu: LayoutMenuItem [] = [
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
        items: [
            {
                label: $t('Modules'),
                to: '/admin/modules',
                icon: 'PuzzleIcon',
            },
        ]
    }
]

export default menu
