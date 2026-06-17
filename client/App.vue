<script setup lang="ts">
import { Toaster } from '#client/components/ui/sonner'
import 'vue-sonner/style.css'
import { ref, shallowRef } from 'vue'
import { layout, emmitter } from '@sidekick-coder/zenith-kit/client'

const layoutId = ref(layout.currendId)
const layoutComponent = shallowRef()
const loading = ref(true)

async function load() {
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

load()
</script>
<template>
    <Toaster
        position="top-right"
        :toast-options="{ class: 'whitespace-pre-line' }"
    />

    <!-- animate with tailwind fade in -->
    <router-view
        v-slot="{ Component }"
    >
        <component
            :is="layoutComponent"
            v-if="layoutComponent"
        >
            <suspense>
                <component
                    :is="Component"
                    v-if="!loading"
                />
            </suspense>
        </component>

        <Suspense v-else>
            <component
                :is="Component"
                v-if="!loading"
            />
        </Suspense>
    </router-view>
</template>
