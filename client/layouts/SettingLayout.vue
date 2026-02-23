<script lang="ts">
import { computed } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { BreadcrumbItem } from '#client/components/ui/breadcrumb'
import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,SidebarMenuButton
} from '#client/components/ui/sidebar'

import { useMenu } from '#client/composables/useMenu.ts'
import Icon from '#client/components/Icon.vue'
import di from '#client/utils/di.ts'

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
    }
})

const breadcrumbs = defineModel('breadcrumbs', {
    type: Array as () => BreadcrumbItem[],
    default: null,
})

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
        .filter(item => item.layout === 'setting')
        .filter(item => !hideIds.includes(item.id))
        .filter(item => !hideGroups.includes(item.group || $t('General')))
})
</script>

<template>
    <AdminLayout
        :menu
        :breadcrumbs
        :padding
        :hide-breadcrumbs
        menu-variant="plain"
        menu-key="setting"
    >
        <template #header>
            <SidebarHeader class="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            as-child
                        >
                            <router-link
                                to="/admin"
                                class="flex items-center space-x-2"
                            >
                                <Icon
                                    name="ArrowLeft"
                                    class="size-5"
                                />
                                
                                <div>
                                    {{ $t('Settings') }}
                                </div>
                            </router-link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
        </template>

        <slot />
    </AdminLayout>
</template>
