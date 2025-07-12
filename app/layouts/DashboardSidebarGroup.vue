<script lang="ts">
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@app/components/ui/dropdown-menu'
import { Sidebar, SidebarInset, SidebarTrigger, SidebarProvider, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSubItem, SidebarMenuSub } from '@app/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@app/components/ui/collapsible';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@app/components/ui/breadcrumb';
import { useBreakpoints, useLocalStorage } from '@vueuse/core';
import Icon from '@app/components/Icon.vue';
import Logo from '@app/components/Logo.vue';
import { computed } from 'vue';

export interface BreadcrumbItem {
    label: string;
    to?: string;
    icon?: string;
}

interface MenuBase {
    label: string;
    order?: number;
}

interface MenuSingle  extends MenuBase {
    icon: string;
    to: string;
}

interface MenuWithChildren extends MenuBase {
    icon: string;
    children: Omit<MenuSingle, 'icon'>[];
}

export type MenuItem = MenuSingle | MenuWithChildren 
</script>
<script setup lang="ts">
const breakpoints = useBreakpoints({ lg: 1024 });
const isLg = breakpoints.greater('lg');

defineProps({
    open: {
        type: Boolean,
        default: true,
    },
    items: {
        type: Array as () => MenuItem[],
        default: () => [],
    },
    label: {
        type: String,
        default: null
    },
});
</script>

<template>
    <SidebarGroup>
        <SidebarGroupLabel v-if="label">
            {{ label }} 
        </SidebarGroupLabel>
        <SidebarMenu>
            <template v-for="item in items" :key="item.label">
                <Collapsible v-if="'children' in item" default-open class="group/collapsible">
                    <SidebarMenuItem>
                        <template v-if="open || !isLg">
                            <CollapsibleTrigger as-child>
                                <SidebarMenuButton :tooltip="item.label">
                                    <Icon :name="item.icon" />
                                    <span>{{ item.label }}</span>
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuButton v-for="child in item.children" :key="child.label" as-child
                                            :is-active="child.to === $route.path" :tooltip="child.label">
                                            <router-link :to="child.to ?? '#'">
                                                {{ child.label }}
                                            </router-link>
                                        </SidebarMenuButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </template>
                        <template v-if="!open && isLg">
                            <DropdownMenu>
                                <DropdownMenuTrigger as-child>
                                    <SidebarMenuButton>
                                        <Icon :name="item.icon" />
                                        <span>{{ item.label }}</span>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" align="start">
                                    <DropdownMenuItem v-for="child in item.children" :key="child.label" as-child>
                                        <RouterLink :to="child.to">
                                            {{ child.label }}
                                        </RouterLink>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </template>
                    </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem v-else>
                    <SidebarMenuButton as-child :is-active="item.to === $route.path" :tooltip="item.label">
                        <RouterLink :to="item.to">
                            <Icon :name="item.icon" />
                            <span>{{ item.label }}</span>
                        </RouterLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </template>
        </SidebarMenu>
    </SidebarGroup>
</template>
