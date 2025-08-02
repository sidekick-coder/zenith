<script setup lang="ts">
import LogoIcon from '#client/components/LogoIcon.vue'

// import CLogoIcon from '@/components/CLogoIcon.vue'
// import { Link, usePage } from '@inertiajs/vue3'

// const page = usePage()
const name = 'Sidekick Coder'
const quote = {
    author: 'Sidekick Coder Team',
    title: 'Empowering Developers',
    message: 'Build, test, and deploy your applications with ease.',
}

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
                src="/login-bg.jpg"
                alt="Background Image"
                class="absolute inset-0 h-full w-full object-cover opacity-50"
            >
            <RouterLink
                to="/"
                class="relative z-20 flex items-center text-lg font-medium"
            >
                {{ name }}
            </RouterLink>

            <div
                v-if="quote"
                class="relative z-20 mt-auto"
            >
                <blockquote class="space-y-2">
                    <p class="text-lg">
                        &ldquo;{{ quote.message }}&rdquo;
                    </p>
                    <footer class="text-sm text-neutral-300">
                        {{ quote.author }}
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