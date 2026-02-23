<script lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import AdminLayout from './AdminLayout.vue'
import AdminLayoutUserMenu from './AdminLayoutUserMenu.vue'
import { BreadcrumbItem } from '#client/components/ui/breadcrumb'

import { useMenu } from '#client/composables/useMenu.ts'
import di from '#client/utils/di.ts'
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
} from '#client/components/ui/sidebar'
import Icon from '#client/components/Icon.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import $fetch from '#client/facades/fetch.facade.ts'

export interface BreadcrumbItem {
    label: string;
    to?: string;
    icon?: string;
}
</script>
<script setup lang="ts">
defineProps({
    padding: {
        type: Boolean,
        default: true,
    },
    hideBreadcrumbs: {
        type: Boolean,
        default: false,
    },
})

const breadcrumbs = defineModel('breadcrumbs', {
    type: Array as () => BreadcrumbItem[],
    default: null,
})

const loading = ref(true)
const { items: menuAll } = useMenu()

menuAll.value.sort((a, b) => {
    const orderA = a.order ? a.order : 98
    
    const orderB = b.order ? b.order : 98

    return orderA - orderB
})

const state = di.get<Record<string, any>>('state')

const metas = state['user:metas'] || {}
const hideIds = metas['admin-ui:hide-menus'] || []
const hideGroups = metas['admin-ui:hide-menu-groups'] || []
const extras = metas['admin-ui:menu-extras'] || []

const menu = computed(() => {
    return menuAll.value
        .concat(extras)
        .filter(item => item.layout === 'admin' || !item.layout)
        .filter(item => !hideIds.includes(item.id))
        .filter(item => !hideGroups.includes(item.group || $t('General')))
})

async function onLogout() {
    const [error] = await tryCatch(() =>  $fetch.post('/auth/logout'))

    if (error) {
        return
    }

    toast.error($t('You have been logged out.'))

    window.location.href = '/'
}

onMounted(() => {
    loading.value = false
})
</script>

<template>
    <AdminLayout
        :menu
        :breadcrumbs
    >
        <slot />

        <template #sidebar-footer>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton as-child>
                            <RouterLink to="/admin/settings">
                                <Icon name="Settings" />
                                <span>{{ $t('Settings') }}</span>
                            </RouterLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <AdminLayoutUserMenu
                    :links="[
                        {
                            label: $t('Preferences'),
                            to: '/admin/menu/items',
                            icon: 'Settings',
                        }
                    ]"
                    @logout="onLogout" 
                />
            </SidebarFooter>
        </template>
    </AdminLayout>
</template>
