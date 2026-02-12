<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'

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
    <div class="flex items-center justify-center h-screen text-2xl font-bold text-gray-500">
        <div class="flex flex-col items-center gap-4">
            <Icon
                name="ShieldAlert"
                class="size-20"
            />
            
            <div>{{ title }}</div>
            <div>{{ message }}</div>

            <Button
                variant="outline"
                size="lg"
                to="/"
            >
                {{ $t('Go to Home') }}
            </Button>
        </div>
    </div>
</template>
