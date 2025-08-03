<script lang="ts" setup>
import { ref } from 'vue'
import { $fetch } from '#client/utils/fetcher.ts'

import Dashboard from '#client/layouts/AppLayout.vue'

const props = defineProps({
    url: {
        type: String,
        required: true,
    },
})

const items = ref([])

async function load(){
    const response = await $fetch(props.url)

    items.value = response.data
}

await load()
</script>

<template>
    <Dashboard>
        <div>items {{ items.length }}</div>
        <div
            v-for="item in items"
            :key="item.id"
        >
            {{ item.id }}
        </div>
    </Dashboard>
</template>
