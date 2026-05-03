<script setup lang="ts">
import { BaseLayout, UserMenu } from '@sidekick-coder/zenith-kit/components'
import { SidebarFooter } from '../components/ui/sidebar'

const userLinks = [
    {
        label: 'Preferences',
        to: '/admin/menu/items',
        icon: 'Settings',
    }
]

</script>

<template>
    <BaseLayout
        layout-id="admin"
        home-path="/admin"
        title="Admin Dashboard"
    >
        <slot />

        <template #sidebar-footer>
            <SidebarFooter>
                <UserMenu :links="userLinks" />
            </SidebarFooter>
        </template>
    </BaseLayout>
</template>
