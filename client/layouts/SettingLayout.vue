<script lang="ts">
import { toast } from 'vue-sonner'
import {
    ref,
    toValue,
    computed,
    onMounted
} from 'vue'
import { useRoute } from 'vue-router'
import { truncate } from 'lodash-es'
import AdminLayout from './AdminLayout.vue'
import AppLayoutSidebarGroup from './AdminLayoutSidebarGroup.vue'
import Logo from '#client/components/Logo.vue'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '#client/components/ui/breadcrumb'
import {
    Sidebar,
    SidebarInset,
    SidebarTrigger,
    SidebarProvider,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,SidebarMenuButton
} from '#client/components/ui/sidebar'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $t } from '#shared/lang.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import type { MenuItem } from '#client/composables/useMenu.ts'
import Icon from '#client/components/Icon.vue'
import config from '#client/facades/config.facade.ts'
import di from '#client/utils/di.ts'
import acl from '#client/facades/acl.facade.ts'

export interface BreadcrumbItem {
    label: string;
    to?: string;
    icon?: string;
}
</script>
<script setup lang="ts">
const open = ref( true)
const loading = ref(true)
const route = useRoute()

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
                            >
                                <div class="flex items-center space-x-4">
                                    <Icon
                                        name="ArrowLeft"
                                        class="size-5"
                                    />
                                    <div>
                                        {{ $t('Settings') }}
                                    </div>
                                </div>
                            </router-link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
        </template>

        <slot />
    </AdminLayout>
    <!-- <SidebarProvider v-model:open="open">
        <Sidebar
            collapsible="icon"
            variant="inset"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            as-child
                        >
                            <router-link to="/">
                                <Logo />
                                <span class="font-medium">{{ config.get('branding.name', 'Dashboard') }}</span>
                            </router-link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent class="gap-0">
                <AppLayoutSidebarGroup
                    v-for="group in groups"
                    :id="group.id"
                    :key="group.label"
                    :open
                    :items="menu.concat(extras)"
                    class="py-0"
                    :label="group.label"
                />
            </SidebarContent>

            <SidebarFooter>
                <button
                    class="w-full py-2 px-4 text-left hover:bg-destructive transition rounded flex items-center space-x-4"
                    @click="onLogout"
                >
                    <Icon
                        name="LogOut"
                        class="rotate-180"
                    />
                    <div>
                        {{ $t('Logout') }}
                    </div>
                </button>
            </SidebarFooter>
        </Sidebar>

        <SidebarInset variant="sidebar">
            <header
                v-if="!hideBreadcrumbs"
                class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
            >
                <div class="flex items-center gap-2">
                    <SidebarTrigger class="-ml-1" />
                    
                    <Breadcrumb v-if="computedBreadcrumbs?.length">
                        <BreadcrumbList class="md:hidden">
                            <BreadcrumbItem>
                                <BreadcrumbPage>{{ truncate(computedBreadcrumbs.at(-1)?.label) }}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                        <BreadcrumbList class="hidden md:flex">
                            <template
                                v-for="(item, index) in computedBreadcrumbs"
                                :key="index"
                            >
                                <BreadcrumbItem>
                                    <template v-if="index === computedBreadcrumbs.length - 1">
                                        <BreadcrumbPage>{{ truncate(item.label) }}</BreadcrumbPage>
                                    </template>
                                    <template v-else>
                                        <BreadcrumbLink as-child>
                                            <RouterLink :to="item.to!">
                                                {{ truncate(item.label) }}
                                            </RouterLink>
                                        </BreadcrumbLink>
                                    </template>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator v-if="index !== computedBreadcrumbs.length - 1" />
                            </template>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div>
                <div
                    class="
                       dashboard-layout-content
                        h-full
                        overflow-auto
                        lg:max-w-[calc(100dvw-8px-var(--sidebar-width))]
                        group-has-data-[collapsible=icon]/sidebar-wrapper:max-w-[calc(100dvw-var(--sidebar-width-icon))]
                    "
                    :class="{
                        'p-5': padding,
                    }"
                >
                    <slot />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider> -->
</template>
