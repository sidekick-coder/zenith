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
        layout-id="account-setting"
        home-path="/admin"
        title="Settings"
        menu-variant="plain"
    >
        <slot /> 

        <template #sidebar-footer>
            <SidebarFooter>
                <UserMenu
                    :links="userLinks"
                />
            </SidebarFooter>
        </template>
    </BaseLayout>>
</template>
