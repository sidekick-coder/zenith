<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '#client/layouts/AuthLayout.vue'
import { Button } from '#client/components/ui/button'

const route = useRoute()

const message = computed(() => {
    const msg = route.query.message
    return (Array.isArray(msg) ? msg[0] : msg || 'No message provided') as string
})

const title = computed(() => {
    const t = route.query.title

    return (Array.isArray(t) ? t[0] : t || 'Message') as string
})
</script>

<template>
    <AuthLayout
        :title="title"
        :description="message"
    >
        <div class="flex flex-col gap-6">
            <Button
                as-child
                class="w-full"
            >
                <RouterLink to="/auth/login">
                    Return to Login
                </RouterLink>
            </Button>
        </div>
    </AuthLayout>
</template>
