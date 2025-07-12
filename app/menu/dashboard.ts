import type { MenuItem } from "@app/layouts/Dashboard.vue";
import { $t } from "@app/utils/lang";

const menu: MenuItem[] = [
    {
        label: $t('Users'),
        icon: 'UsersIcon',
        children: [
            {
                label: $t('List'),
                to: '/users',
            }
        ]
    },
    {
        label: $t('Advanced'),
        items: [
            {
                label: $t('Settings'),
                to: '/settings',
                icon: 'SettingsIcon',
            },
            {
                label: $t('Logs'),
                to: '/logs',
                icon: 'LogsIcon',
            },
            {
                label: $t('Documentation'),
                to: '/docs',
                icon: 'File',
            }
        ]
    }
]

export default menu
