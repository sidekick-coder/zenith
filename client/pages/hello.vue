<script setup lang="ts">
import { computed } from 'vue'
import { $auth } from '#client/composables/useAuth.ts'
import { $t } from '#shared/lang.ts'
import Button from '#client/components/Button.vue'

const isLoggedIn = computed(() => !!$auth.user)

async function handleLogout() {
    await $auth.logout({ redirect: '/admin/auth/login' })
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
        </div>
    </div>
</template>