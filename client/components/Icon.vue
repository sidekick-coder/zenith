<script setup lang="ts">
import 'iconify-icon'
import { computed } from 'vue'
import { kebabCase } from 'lodash-es'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
})

const iconName = computed(() => {
    if (props.name.includes(':')) {
        return props.name
    }

    return `lucide:${kebabCase(props.name)}`
})
</script>

<template>
    <iconify-icon
        :icon="iconName"
        ssr
    />
</template>