<script setup lang="ts">
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'

</script>

<template>
    <div class="flex items-center justify-center h-screen text-2xl font-bold text-gray-500">
        <div class="flex flex-col items-center gap-4">
            <Icon
                name="ShieldAlert"
                class="size-20"
            />
            <div>404 error</div>

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
