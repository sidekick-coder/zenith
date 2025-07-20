
import type { LayoutMenuItem } from '#app/layouts/Dashboard.vue'
import { $t } from '#app/utils/lang'

const menu: LayoutMenuItem[] = [
    {
        label: $t('Blog'),
        items: [
            {
                label: $t('Posts'),
                icon: 'File',
                to: '/blog/posts',
            },
            {
                label: $t('API'),
                icon: 'Code',
                to: '/api/blog/posts',
                target: '_blank',
            },
        ]
    }
]

export default menu
