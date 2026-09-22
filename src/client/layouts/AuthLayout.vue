<script setup lang="ts">
import { ZButton, Icon } from '@sidekick-coder/zenith-kit/components'
import { config, useDarkMode } from '@sidekick-coder/zenith-kit/client'

const darkMode = useDarkMode()

const authConfig = config.get('auth', {
    title: 'Welcome',
    quote: 'Your journey to productivity starts here.',
    quote_author: 'The Team',
})

defineProps<{
    title?: string;
    description?: string;
}>()
</script>

<template>
    <div
        class="relative flex min-h-screen flex-col items-center justify-center px-4"
    >
        <ZButton
            variant="outline"
            class="absolute right-4 top-4 hidden h-9 w-9 p-0 lg:flex"
            @click="darkMode = !darkMode"
        >
            <Icon
                :name="darkMode ? 'mdi:weather-sunny' : 'mdi:weather-night'"
                class="h-4 w-4"
            />
        </ZButton>
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div class="flex flex-col space-y-2 text-center">
                <h1
                    v-if="title"
                    class="text-xl font-medium tracking-tight"
                >
                    {{ title }}
                </h1>
                <p
                    v-if="description"
                    class="text-sm text-muted-foreground"
                >
                    {{ description }}
                </p>
            </div>
            <slot />
        </div>
    </div>
</template>
