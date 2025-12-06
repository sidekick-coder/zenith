<script setup lang="ts">
import { computed } from 'vue'
import { $t } from '#shared/lang.ts'
import Button from '#client/components/Button.vue'
import { $acl } from '#client/composables/useAcl.ts'
import auth from '#client/facades/auth.facade.ts'

const isLoggedIn = computed(() => auth.user)

async function handleLogout() {
    await auth.logout({ redirect: '/admin/auth/login' })
}
</script>

<template>
    <div class="min-h-screen bg-background flex items-center justify-center">
        <div class="max-w-md w-full mx-auto text-center space-y-6">
            <div class="space-y-2">
                <h1 class="text-4xl font-bold text-foreground">
                    {{ $t('Hello World!') }}
                </h1>
                <p class="text-muted-foreground">
                    {{ $t('Welcome to your simple hello page.') }}
                </p>
            </div>

            <div class="flex gap-2 justify-center">
                <Button
                    v-if="isLoggedIn"
                    :label="$t('Logout')"
                    variant="destructive"
                    @click="handleLogout"
                />
                
                <Button
                    v-if="!isLoggedIn"
                    :label="$t('Login')"
                    to="/admin/auth/login"
                />
    
                <Button
                    v-if="$acl.can('read', 'AdminDashboard')"
                    :label="$t('Go to Admin Dashboard')"
                    to="/admin"
                />
            </div>
        </div>
    </div>
</template>