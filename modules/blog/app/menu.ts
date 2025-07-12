
import type { LayoutMenuItem } from "@app/layouts/Dashboard.vue";
import { $t } from "@app/utils/lang";

const menu: LayoutMenuItem[] = [
    {
        label: $t('Blog'),
        items: [
            {
                label: $t('Posts'),
                icon: 'File',
                to: '/blog/posts',
            },
        ]
    }
]

export default menu
