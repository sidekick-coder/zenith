<script setup lang="ts">
import { computed } from 'vue'
import auth from '#client/facades/auth.facade.ts'
import { $t } from '#shared/lang.ts'
import {
    Avatar,
    AvatarFallback,
} from '#client/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '#client/components/ui/sidebar'
import Icon from '#client/components/Icon.vue'

const emit = defineEmits(['logout'])

const { isMobile } = useSidebar()

const userName = computed(() => auth.user?.name || $t('User'))
const userEmail = computed(() => auth.user?.email || '')
const userInitials = computed(() => auth.user?.initials || 'U')

function handleLogout() {
    emit('logout')
}
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <SidebarMenuButton
                        size="lg"
                        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar class="h-8 w-8 rounded-lg">
                            <AvatarFallback class="rounded-lg">
                                {{ userInitials }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-medium">{{ userName }}</span>
                            <span class="truncate text-xs">{{ userEmail }}</span>
                        </div>
                        <Icon
                            name="ChevronsUpDown"
                            class="ml-auto size-4"
                        />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    :side="isMobile ? 'bottom' : 'right'"
                    align="start"
                    :side-offset="4"
                >
                    <DropdownMenuLabel class="p-0 font-normal">
                        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar class="h-8 w-8 rounded-lg">
                                <AvatarFallback class="rounded-lg">
                                    {{ userInitials }}
                                </AvatarFallback>
                            </Avatar>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-medium">{{ userName }}</span>
                                <span class="truncate text-xs">{{ userEmail }}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem as-child>
                            <RouterLink to="/admin/account/preferences">
                                <Icon name="Settings" />
                                {{ $t('Preferences') }}
                            </RouterLink>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="handleLogout">
                        <Icon
                            name="LogOut"
                            class="rotate-180"
                        />
                        {{ $t('Logout') }}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
