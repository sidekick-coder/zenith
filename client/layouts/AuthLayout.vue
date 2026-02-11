<script setup lang="ts">
import config from '#client/facades/config.facade.ts'

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
    <div class="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
            <div class="absolute inset-0 bg-zinc-900" />
            <img
                :src="authConfig.image_id ? `/api/files/${authConfig.image_id}/stream` : '/login-bg.jpg'"
                alt="Background Image"
                class="absolute inset-0 h-full w-full object-cover opacity-50"
            >
            <RouterLink
                to="/"
                class="relative z-20 flex items-center text-lg font-medium"
            >
                {{ authConfig.title }}
            </RouterLink>

            <div
                v-if="authConfig.quote"
                class="relative z-20 mt-auto"
            >
                <blockquote class="space-y-2">
                    <p class="text-lg">
                        &ldquo;{{ authConfig.quote }}&rdquo;
                    </p>
                    <footer class="text-sm text-neutral-300">
                        {{ authConfig.quote_author }}
                    </footer>
                </blockquote>
            </div>
        </div>
        <div class="lg:p-8">
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
    </div>
</template>