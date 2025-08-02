<script lang="ts">
import { useBreakpoints } from '@vueuse/core'
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem 
} from '#app/components/ui/dropdown-menu'
import {
    SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSubItem, SidebarMenuSub 
} from '#app/components/ui/sidebar'
import {
    Collapsible, CollapsibleTrigger, CollapsibleContent 
} from '#app/components/ui/collapsible'
import Icon from '#app/components/Icon.vue'

interface MenuBase {
    label: string;
    order?: number;
}

interface MenuSingle  extends MenuBase {
    icon: string;
    to: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
}

interface MenuWithChildren extends MenuBase {
    icon: string;
    children: Omit<MenuSingle, 'icon'>[];
}

export type MenuItem = MenuSingle | MenuWithChildren 
</script>
<script setup lang="ts">
const breakpoints = useBreakpoints({ lg: 1024 })
const isLg = breakpoints.greater('lg')

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
})
</script>

<template>
    <SidebarGroup>
        <SidebarGroupLabel v-if="label && open">
            {{ label }} 
        </SidebarGroupLabel>
        <SidebarMenu>
            <template
                v-for="(item, index) in items"
                :key="index"
            >
                <Collapsible
                    v-if="'children' in item && open"
                    default-open
                    class="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger as-child>
                            <SidebarMenuButton
                                :tooltip="item.label"
                            >
                                <Icon :name="item.icon" />
                                <span>{{ item.label }}</span>
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuButton
                                        v-for="child in item.children"
                                        :key="child.label"
                                        as-child
                                        :is-active="child.to === $route.path"
                                        :tooltip="child.label"
                                    >
                                        <router-link :to="child.to ?? '#'">
                                            {{ child.label }}
                                        </router-link>
                                    </SidebarMenuButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem v-else-if="'children' in item">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <SidebarMenuButton>
                                <Icon :name="item.icon" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="right"
                            align="start"
                        >
                            <DropdownMenuItem
                                v-for="child in item.children"
                                :key="child.label"
                                as-child
                            >
                                <RouterLink
                                    :to="child.to"
                                    :target="child.target ?? '_self'"
                                >
                                    {{ child.label }}
                                </RouterLink>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>


                <SidebarMenuItem v-else>
                    <SidebarMenuButton
                        as-child
                        :is-active="item.to === $route.path"
                        :tooltip="item.label"
                    >
                        <RouterLink
                            :to="item.to"
                            :target="item.target ?? '_self'"
                        >
                            <Icon :name="item.icon" />
                            <span>{{ item.label }}</span>
                        </RouterLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </template>
        </SidebarMenu>
    </SidebarGroup>
</template>
