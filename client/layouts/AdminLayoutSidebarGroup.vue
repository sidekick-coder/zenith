<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSubItem,
    SidebarMenuSub 
} from '#client/components/ui/sidebar'
import {
    Collapsible, CollapsibleTrigger, CollapsibleContent 
} from '#client/components/ui/collapsible'
import Icon from '#client/components/Icon.vue'
import type { MenuItem } from '#client/composables/useMenu.ts'

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
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
const cache = useLocalStorage<boolean>(`sidebar-group-open-${props.id}`, true)
const isGroupOpen = ref(true)

function hasChilden(item: MenuItem) {
    return props.items.some(i => i.parent === item.id)
}

onMounted(() => {
    isGroupOpen.value = cache.value
})

watch(isGroupOpen, (newVal) => {
    cache.value = newVal
})
</script>

<template>
    <Collapsible 
        v-model:open="isGroupOpen"
        class="group/collapsible"
    >
        <SidebarGroup>
            <CollapsibleTrigger as-child>
                <SidebarGroupLabel class="p-0">
                    <div class="cursor-pointer hover:bg-muted px-2 py-1 rounded-md flex items-center gap-2">
                        {{ label }} 
                    </div>
                </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenu>
                    <template
                        v-for="(item, index) in items.filter(i => i.group === id)"
                        :key="index"
                    >
                        <Collapsible
                            v-if="hasChilden(item) && open"
                            default-open
                            class="group/collapsible-2"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger as-child>
                                    <SidebarMenuButton
                                        :tooltip="item.label"
                                    >
                                        <Icon :name="item.icon || 'heroicons:cube'" />
                                        <span>{{ item.label }}</span>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuButton
                                                v-for="child in items.filter(i => i.parent === item.id)"
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

                        <SidebarMenuItem v-else>
                            <SidebarMenuButton
                                as-child
                                :is-active="item.to === $route.path"
                                :tooltip="item.label"
                            >
                                <RouterLink
                                    :to="item.to ?? '#'"
                                    :target="item.target ?? '_self'"
                                >
                                    <Icon :name="item.icon || 'heroicons:cube'" />
                                    <span>{{ item.label }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </template>
                </SidebarMenu>
            </CollapsibleContent>
        </SidebarGroup>
    </Collapsible>
</template>
