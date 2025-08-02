<script lang="ts">
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import DashboardSidebarGroup from './DashboardSidebarGroup.vue'
import type { MenuItem } from './DashboardSidebarGroup.vue'
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
import { tryCatch } from '#shared/tryCatch.ts'
import { $t } from '#shared/lang.ts'

export interface BreadcrumbItem {
    label: string;
    to?: string;
    icon?: string;
}

interface MenuGroup {
    label: string;
    order?: number;
    items: MenuItem[];
}

export type LayoutMenuItem = MenuItem | MenuGroup;

export interface MenuModule {
    default: MenuItem[];
}
</script>
<script setup lang="ts">
const open = ref( true)

defineProps({
    padding: {
        type: Boolean,
        default: true,
    },
})

const menu = defineModel('menu', {
    type: Array as () => MenuItem[],
    default: null,
})

const breadcrumbs = defineModel('breadcrumbs', {
    type: Array as () => BreadcrumbItem[],
    default: null,
})

if (!menu.value) {
    const files = import.meta.glob<MenuModule>('../menu/*.ts', { eager: true })

    menu.value = Object.values(files).map(f => f.default).flat()
}

if (!breadcrumbs.value) {
    breadcrumbs.value = []
}

menu.value.sort((a, b) => {
    const orderA = a.order ? a.order : 98
    const orderB = b.order ? b.order : 98
    return orderA - orderB
})

const ungrouped = menu.value.filter(item => 'to' in item || 'children' in item)
const grouped = menu.value.filter(item => 'items' in item) as MenuGroup[]

async function onLogout() {
    const [error] = await tryCatch(() =>  $fetch('/auth/logout', { method: 'POST', }))

    if (error) {
        return
    }

    toast.error($t('You have been logged out.'))

    window.location.href = '/admin/auth/login'
}
</script>

<template>
    <SidebarProvider v-model:open="open">
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
                            </router-link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <DashboardSidebarGroup
                    :open
                    :items="ungrouped"
                    :label="$t('General')"
                    class="py-0"
                />
                <DashboardSidebarGroup
                    v-for="group in grouped"
                    :key="group.label"
                    :open
                    :items="group.items"
                    class="py-0"
                    :label="group.label"
                />
            </SidebarContent>

            <SidebarFooter>
                <button
                    class="w-full py-2 px-4 text-left hover:bg-gray-100 transition rounded"
                    @click="onLogout"
                >
                    Logout
                </button>
            </SidebarFooter>
        </Sidebar>

        <SidebarInset variant="sidebar">
            <header
                class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4"
            >
                <div class="flex items-center gap-2">
                    <SidebarTrigger class="-ml-1" />
                    <template v-if="breadcrumbs && breadcrumbs.length > 0">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <template
                                    v-for="(item, index) in breadcrumbs"
                                    :key="index"
                                >
                                    <BreadcrumbItem>
                                        <template v-if="index === breadcrumbs.length - 1">
                                            <BreadcrumbPage>{{ item.label }}</BreadcrumbPage>
                                        </template>
                                        <template v-else>
                                            <BreadcrumbLink as-child>
                                                <RouterLink :to="item.to!">
                                                    {{ item.label }}
                                                </RouterLink>
                                            </BreadcrumbLink>
                                        </template>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator v-if="index !== breadcrumbs.length - 1" />
                                </template>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </template>
                </div>
            </header>
            <div class="h-[calc(100dvh-5rem)] overflow-hidden">
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
    </SidebarProvider>
</template>
