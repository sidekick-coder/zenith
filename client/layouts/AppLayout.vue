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
import AppLayoutSidebarGroup from './AppLayoutSidebarGroup.vue'
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

const menu = defineModel('menu', {
    type: Array as () => MenuItem[],
    default: null,
})

const breadcrumbs = defineModel('breadcrumbs', {
    type: Array as () => BreadcrumbItem[],
    default: null,
})

const computedBreadcrumbs = computed(() => {
    if (breadcrumbs.value) {
        return breadcrumbs.value
    }
    
    return generateBreadcrumbsFromRoute()
})

function generateBreadcrumbsFromRoute(): BreadcrumbItem[] {
    const pathSegments = route.path.split('/').filter(segment => segment !== '')
    const breadcrumbItems: BreadcrumbItem[] = []
    
    // Add home breadcrumb only if we're not on the home page
    if (route.path !== '/') {
        // breadcrumbItems.push({
        //     label: $t('Home'),
        //     to: '/admin',
        // })
    }
    
    // Generate breadcrumbs for each path segment
    let currentPath = ''
    for (let i = 0; i < pathSegments.length; i++) {
        currentPath += `/${pathSegments[i]}`
        const segment = pathSegments[i]
        
        // Skip dynamic segments (they start with :)
        if (segment.startsWith(':') || segment === 'admin') {
            continue
        }
        
        // Capitalize first letter and replace hyphens with spaces
        const label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        
        breadcrumbItems.push({
            label: $t(label),
            to: i === pathSegments.length - 1 ? undefined : currentPath,
        })
    }
    
    return breadcrumbItems
}

if (!menu.value) {
    const { items } = useMenu()

    menu.value = toValue(items) || []
}

menu.value.sort((a, b) => {
    const orderA = a.order ? a.order : 98
    const orderB = b.order ? b.order : 98
    return orderA - orderB
})

// const ungrouped = menu.value.filter(item => 'to' in item || 'children' in item)
// const grouped = menu.value.filter(item => 'items' in item) as MenuGroup[]
interface GroupedMenu {
    id: string;
    label: string;
    items: MenuItem[];
}

const metas = di.get<Record<string, any>>('user:metas', {})
const hideIds = metas['admin-ui:hide-menus'] || []
const hideGroups = metas['admin-ui:hide-menu-groups'] || []
const extras = metas['admin-ui:menu-extras'] || []

// menu.removeMany(metas['admin-ui:hide-menus'] || [])
// menu.removeManyGroup(metas['admin-ui:hide-menu-groups'] || [])

const groups = computed(() => {
    const result = [] as GroupedMenu[]
    const items = menu.value.concat(extras)
    
    // mount groups
    for (const item of items) {
        const group = item.group || $t('General')

        if (hideIds.includes(item.id)) {
            continue
        }

        if (hideGroups.includes(group)) {
            continue
        }


        let current = result.find(g => g.id === group)

        if (!current) {
            current = {
                id: group,
                label: group,
                items: []
            }

            result.push(current)
        }

        current.items.push(item)
    }

    return result
})

async function onLogout() {
    const [error] = await tryCatch(() =>  $fetch('/auth/logout', { method: 'POST', }))

    if (error) {
        return
    }

    toast.error($t('You have been logged out.'))

    window.location.href = '/'
}

onMounted(() => {
    if (acl.cannot('read', 'AdminDashboard')) {
        window.location.href = '/404'
        return
    }

    loading.value = false
})
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
                                <span class="font-medium">{{ config.get('branding.name', 'Dashboard') }}</span>
                            </router-link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
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
    </SidebarProvider>
</template>
