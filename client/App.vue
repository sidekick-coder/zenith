<script setup lang="ts">
import { Toaster } from '#client/components/ui/sonner'
import 'vue-sonner/style.css'
import { ref, shallowRef } from 'vue'
import { layout, emmitter } from '@sidekick-coder/zenith-kit/client'

const layoutId = ref(layout.currendId)
const layoutComponent = shallowRef()
const layoutOptions = ref({})
const loading = ref(true)

async function load() {
    loading.value = true

    let component = null
    let options = {}
    let id = null

    if (layout.currendId) {
        component = layout.get(layout.currendId)
        options = layout.getOptions(layout.currendId)
        id = layout.currendId
    }

    if (typeof component === 'function') {
        const mod = await component()

        component = mod.default || mod
    }


    layoutComponent.value = component
    layoutOptions.value = options
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
    <router-view v-slot="{ Component }">
        <component
            :is="layoutComponent"
            v-bind="layoutOptions"
            v-if="layoutComponent"
        >
            <suspense>
                <component :is="Component" />
            </suspense>
        </component>

        <Suspense v-else>
            <component :is="Component" />
        </Suspense>
    </router-view>
</template>
