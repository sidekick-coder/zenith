<script lang="ts">
import { Sidebar, SidebarInset, SidebarTrigger, SidebarProvider, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@app/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@app/components/ui/breadcrumb';
import { useLocalStorage } from '@vueuse/core';
import Logo from '@app/components/Logo.vue';
import DashboardSidebarGroup, { type MenuItem } from './DashboardSidebarGroup.vue';

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
const open = useLocalStorage('sidebar-open', true);

const menu = defineModel("menu", {
    type: Array as () => MenuItem[],
    default: null,
});

const breadcrumbs = defineModel("breadcrumbs", {
    type: Array as () => BreadcrumbItem[],
    default: null,
});

if (!menu.value) {
    const files = import.meta.glob<MenuModule>('../menu/*.ts', { eager: true });

    menu.value = Object.values(files).map(f => f.default).flat();
}

if (!breadcrumbs.value) {
    breadcrumbs.value = [];
}

menu.value.sort((a, b) => {
    const orderA = a.order ? a.order : 98;
    const orderB = b.order ? b.order : 98;
    return orderA - orderB;
});

const ungrouped = menu.value.filter(item => 'to' in item || 'children' in item);
const grouped = menu.value.filter(item => 'items' in item) as MenuGroup[];
</script>

<template>
    <SidebarProvider v-model:open="open">
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" as-child>
                            <router-link to="/">
                                <Logo />
                            </router-link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <DashboardSidebarGroup :open="open" :items="ungrouped" :label="$t('General')" class="py-0" />
                <DashboardSidebarGroup v-for="group in grouped" :key="group.label" :open :items="group.items"
                    class="py-0" :label="group.label" />
            </SidebarContent>

            <SidebarFooter>
                Footer
            </SidebarFooter>
        </Sidebar>

        <SidebarInset variant="sidebar">
            <header
                class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div class="flex items-center gap-2">
                    <SidebarTrigger class="-ml-1" />
                    <template v-if="breadcrumbs && breadcrumbs.length > 0">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <template v-for="(item, index) in breadcrumbs" :key="index">
                                    <BreadcrumbItem>
                                        <template v-if="index === breadcrumbs.length - 1">
                                            <BreadcrumbPage>{{ item.label }}</BreadcrumbPage>
                                        </template>
                                        <template v-else>
                                            <BreadcrumbLink as-child>
                                                <RouterLink :to="item.to">
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
                <div class="
                        h-full
                        overflow-auto
                        lg:max-w-[calc(100dvw-8px-var(--sidebar-width))]
                        group-has-data-[collapsible=icon]/sidebar-wrapper:max-w-[calc(100dvw-var(--sidebar-width-icon))]
                    ">
                    <slot />
                </div>
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>
