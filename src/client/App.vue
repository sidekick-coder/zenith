<script setup lang="ts">
import 'vue-sonner/style.css'
import { ref, shallowRef } from 'vue'
import { layout, emmitter } from '@sidekick-coder/zenith-kit/client'
import { Toaster } from '#client/components/ui/sonner/index.ts'

const layoutId = ref(layout.currendId)
const layoutComponent = shallowRef()
const loading = ref(true)

async function load() {
    if (layoutId.value === layout.currendId && layoutComponent.value) {
        return
    }

    loading.value = true

    let component = null
    let id = null

    if (layout.currendId) {
        component = layout.get(layout.currendId)
        id = layout.currendId
    }

    if (typeof component === 'function') {
        const mod = await component()

        component = mod.default || mod
    }


    layoutComponent.value = component
    layoutId.value = id

    await new Promise((resolve) => setTimeout(resolve, 100))

    loading.value = false
}

emmitter.on('layout:change', load)

await load()
</script>
<template>
    <Toaster
        position="top-right"
        close-button
        :toast-options="{
            unstyled: true,
            classes: {
                toast: 'flex items-center gap-2 pl-2 pr-8 py-3 bg-background text-foreground shadow-md border border-border rounded-md',
                title: 'font-semibold text-foreground text-sm',
                description: 'whitespace-pre-line text-sm text-foreground',
                closeButton: 'text-foreground hover:text-foreground absolute top-3 right-1 rounded-md size-5 flex items-center justify-center',
            }
        }"
    />

    <!-- animate with tailwind fade in -->
    <router-view v-slot="{ Component }">
        <component
            :is="layoutComponent"
            v-if="layoutComponent"
        >
            <component
                :is="Component"
                v-if="!loading"
            />
        </component>

        <component
            :is="Component"
            v-else-if="!loading"
        />
    </router-view>
</template>
