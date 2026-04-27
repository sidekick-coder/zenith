<script setup lang="ts">
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../components/ui/sidebar'
import AdminLayoutUserMenu from './AdminLayoutUserMenu.vue'
import BaseLayout from './BaseLayout.vue'
import Icon from '#client/components/Icon.vue'
import auth from '#client/facades/auth.facade.ts'

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
                <AdminLayoutUserMenu
                    :links="userLinks"
                    @logout="auth.logout" 
                />
            </SidebarFooter>
        </template>
    </BaseLayout>
</template>
